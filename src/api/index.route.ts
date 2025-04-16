import { Router } from "express";
import type { Container } from "../container";
import { createVehicleRouter } from "./vehicle/routes/vehicle.routes";

const createV1Router = (container: Container) => {
  const router = Router();
  router.use("/vehicle", createVehicleRouter(container));

  return router;
};

export const createAppRouter = (container: Container) => {
  const router = Router();

  router.use("/v1", createV1Router(container));

  return router;
};
