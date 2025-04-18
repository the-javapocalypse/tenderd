import { Router } from "express";
import type { Container } from "../../../container";
import createCreateMaintenanceHandler from "../handlers/create-maintenance.handler";

export const createMaintenanceRouter = (container: Container) => {
  const router = Router();

  router.post("/", createCreateMaintenanceHandler(container));

  return router;
};
