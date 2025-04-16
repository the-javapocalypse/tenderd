import type { ZodSchema } from "zod";
import { z, ZodError } from "zod";
import { ApiError } from "./exception-handler.service";
import { StatusCodes } from "http-status-codes";
import { ObjectId } from "mongodb";

export class ValidationService {
  validateIdParam(data: any) {
    try {
      const IdSchema = z.object({
        id: z.string().refine((id) => ObjectId.isValid(id), {
          message: "The provided id is not a valid ObjectId",
        }),
      });
      if (!IdSchema || typeof IdSchema.parse !== "function") {
        throw new ApiError(
          "Invalid schema provided",
          StatusCodes.INTERNAL_SERVER_ERROR,
          {
            type: "ValidationError",
            data: { message: "Schema must be a valid Zod schema" },
          }
        );
      }
      return IdSchema.parse(data);
    } catch (error: any) {
      if (error instanceof ZodError) {
        const validationErrors = error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
          code: issue.code,
        }));

        const firstError = validationErrors[0];
        const message = firstError
          ? `Validation failed with one or more errors. [${firstError.path}]: ${firstError.message} (${firstError.code})`
          : "Validation failed";

        throw new ApiError(message, StatusCodes.BAD_REQUEST, {
          type: "ValidationError",
          data: {
            validationErrors,
          },
        });
      }

      throw new ApiError(
        "Unknown validation error",
        StatusCodes.BAD_REQUEST,
        undefined,
        error
      );
    }
  }

  validatePaginationQuery(data: any) {
    try {
      const IdSchema = z.object({
        page: z.coerce.number().positive().min(1).default(1),
        limit: z.coerce.number().positive().max(100).min(1).default(10),
      });
      if (!IdSchema || typeof IdSchema.parse !== "function") {
        throw new ApiError(
          "Invalid schema provided",
          StatusCodes.INTERNAL_SERVER_ERROR,
          {
            type: "ValidationError",
            data: { message: "Schema must be a valid Zod schema" },
          }
        );
      }
      return IdSchema.parse(data);
    } catch (error: any) {
      if (error instanceof ZodError) {
        const validationErrors = error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
          code: issue.code,
        }));

        const firstError = validationErrors[0];
        const message = firstError
          ? `Validation failed with one or more errors. [${firstError.path}]: ${firstError.message} (${firstError.code})`
          : "Validation failed";

        throw new ApiError(message, StatusCodes.BAD_REQUEST, {
          type: "ValidationError",
          data: {
            validationErrors,
          },
        });
      }

      throw new ApiError(
        "Unknown validation error",
        StatusCodes.BAD_REQUEST,
        undefined,
        error
      );
    }
  }

  validateData<T extends ZodSchema>(schema: T, data: any): z.infer<T> {
    try {
      if (!schema || typeof schema.parse !== "function") {
        throw new ApiError(
          "Invalid schema provided",
          StatusCodes.INTERNAL_SERVER_ERROR,
          {
            type: "ValidationError",
            data: { message: "Schema must be a valid Zod schema" },
          }
        );
      }

      return schema.parse(data);
    } catch (error: any) {
      if (error instanceof ZodError) {
        const validationErrors = error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
          code: issue.code,
        }));

        const firstError = validationErrors[0];
        const message = firstError
          ? `Validation failed with one or more errors. [${firstError.path}]: ${firstError.message} (${firstError.code})`
          : "Validation failed";

        throw new ApiError(message, StatusCodes.BAD_REQUEST, {
          type: "ValidationError",
          data: {
            validationErrors,
          },
        });
      }

      throw new ApiError(
        "Unknown validation error",
        StatusCodes.BAD_REQUEST,
        undefined,
        error
      );
    }
  }
}

export default ValidationService;
