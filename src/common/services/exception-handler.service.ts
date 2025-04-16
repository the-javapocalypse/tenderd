import type * as Sentry from "@sentry/node";
import type {
  ErrorRequestHandler,
  Request,
  Response,
  NextFunction,
} from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";

type Primitive = number | string | boolean | bigint | symbol | null | undefined;

export class ContextualError extends Error {
  constructor(
    public message: string,
    public originalError?: Error,
    public contexts?: Record<string, any>,
    public tags?: Record<string, Primitive>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.contexts = contexts;
    this.originalError = originalError;
    this.tags = tags;
  }
}

export class ApiError extends ContextualError {
  constructor(
    public message: string,
    public status: StatusCodes = StatusCodes.INTERNAL_SERVER_ERROR,
    public details?: { data: any; type: string },
    public originalError?: Error,
    public context?: Record<string, any>,
    public tags?: Record<string, Primitive>
  ) {
    super(message, originalError, context, tags);
    this.name = this.constructor.name;
    this.details = details;
    this.originalError = originalError;
  }
}

class ExceptionHandlerService {
  private readonly sentry: typeof Sentry;

  constructor({ sentry }: { sentry: any }) {
    this.sentry = sentry;
  }

  private trySafeStringify(value: any) {
    try {
      return JSON.stringify(value);
    } catch (_error) {
      return undefined;
    }
  }

  private logToSentry(error: ContextualError) {
    if (this.sentry) {
      this.sentry.captureException(error.originalError ?? error, {
        tags: error.tags,
        extra: error.contexts,
      });
    }
  }

  public handleError(
    error: ContextualError,
    logToSentry: boolean = true
  ): void {
    this.logErrorToConsole(error, error.contexts, error.tags);

    if (logToSentry) this.logToSentry(error);
  }

  public logErrorToConsole = (
    error: Error,
    contexts?: Record<string, any>,
    tags?: Record<string, Primitive>
  ) => {
    console.error(
      `[${new Date().toISOString()}] Error occurred:\n`,
      JSON.stringify(
        {
          message: error.message,
          name: error.name,
          tags,
          contexts,
        },
        null,
        2
      )
    );
  };

  public getRequestContextualData(req: Request) {
    const requestContext = {
      requestUrl: req.originalUrl || req.url,
      requestMethod: req.method,
      requestQuery: this.trySafeStringify(req.query),
      requestBody: this.trySafeStringify(req.body),
    };

    return {
      contexts: {
        "Request context": requestContext,
      },
    };
  }

  public catchApiError(logToSentry: boolean = true): ErrorRequestHandler {
    return (error: any, req: Request, res: Response, next: NextFunction) => {
      let eventId;

      const { contexts: requestContexts } = this.getRequestContextualData(req);

      if (error instanceof ZodError) {
        const validationErrors = error.issues.map((issue) => {
          const baseError = {
            path: issue.path.join("."),
            message: issue.message,
            code: issue.code,
          };

          // Add received only for relevant issue types
          if (issue.code === "invalid_type") {
            return {
              ...baseError,
              received: issue.received,
            };
          }

          return baseError;
        });

        error = new ApiError("Validation failed", StatusCodes.BAD_REQUEST, {
          type: "ValidationError",
          data: {
            total: validationErrors.length,
            validationErrors,
          },
        });
      }

      // catch explicitly thrown API errors, log only if original error was included
      // return consumer friendly status codes and message
      if (error instanceof ApiError) {
        const data = error?.details?.data;
        const type = error?.details?.type;
        const { status, message } = error;

        if (error.originalError) {
          eventId = this.handleError(
            new ContextualError(error.message, error.originalError, {
              ...requestContexts,
              "ApiError context": {
                data,
                type,
                status,
              },
            })
          );
        } else {
          eventId = this.handleError(
            new ContextualError(error.message, error, {
              ...requestContexts,
              "ApiError context": {
                data,
                type,
                status,
              },
            })
          );
        }
        res
          .status(status)
          .json({ message, eventId, ...(data && type ? { data, type } : {}) });
        return;
      }

      // catch and log explicitly thrown errors with contextual information
      if (error instanceof ContextualError) {
        const eventId = this.handleError(error);
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "Internal server error", eventId });
        return;
      }

      // catch the rest of exceptions including any unexpected errors
      eventId = this.handleError(
        new ContextualError(error.message, error, {
          ...requestContexts,
        })
      );
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error", eventId });
    };
  }
}

export default ExceptionHandlerService;
