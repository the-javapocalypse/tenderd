import { Router } from "express";
import type { Container } from "../container";
import { createVehicleRouter } from "./vehicle/routes/vehicle.routes";
import { createMaintenanceRouter } from "./maintenance/routes/maintenance.routes";
const createV1Router = (container: Container) => {
  const router = Router();
  router.use("/vehicle", createVehicleRouter(container));
  router.use("/maintenance", createMaintenanceRouter(container));
  return router;
};

export const createAppRouter = (container: Container) => {
  const router = Router();

  router.use("/v1", createV1Router(container));

  return router;
};
