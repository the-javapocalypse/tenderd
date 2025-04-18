import type { Express, NextFunction, Request, Response } from "express";
import express from "express";
import type { Container } from "../../container";
import { StatusCodes } from "http-status-codes";
import cors from "cors";
import bodyParser from "body-parser";
import { createAppRouter } from "../../api/index.route";
import { SocketService } from "./socket.service";

export class ExpressServer {
  private readonly container: Container;

  constructor(container: Container) {
    this.container = container;
  }

  createExpressApp(): Express {
    const app = express();
    const { config, exceptionHandlerService } = this.container;
    const { allowedOrigins, port } = config;

    // Enable Cross-Origin Resource Sharing
    const corsOptions: cors.CorsOptions = {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    };
    app.use(cors(corsOptions));

    // Parse JSON bodies
    app.use(express.json());
    app.use(bodyParser.json());

    // Parse URL-encoded bodies
    app.use(express.urlencoded({ extended: true }));

    // Mount all API routes under /api
    app.use("/api", createAppRouter(this.container));

    // Health check/status endpoint
    app.get("/status", (_req: any, res: any) => {
      res.send("OK");
      res.status(StatusCodes.OK).end();
    });

    // Exception handling
    app.use(exceptionHandlerService.catchApiError());

    // Start the server
    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    // Initialize Socket.IO service
    const socketService = new SocketService(server, this.container);

    // Add socketService to container for use throughout the application
    this.container.socketService = socketService;

    return app;
  }
}
