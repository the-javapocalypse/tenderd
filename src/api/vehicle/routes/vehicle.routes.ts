import { Router } from "express";
import type { Container } from "../../../container";
import createCreateVehicleHandler from "../handlers/create-create-vehicle.handler";
import createListVehicleHandler from "../handlers/create-list-vehicle.handler";
import createGetVehicleHandler from "../handlers/create-get-vehicle.handler";
import createUpdateVehicleHandler from "../handlers/create-update-vehicle.handler";
import createDeleteVehicleHandler from "../handlers/create-delete-vehicle.handler";

export const createVehicleRouter = (container: Container) => {
  const router = Router();

  router.post("/", createCreateVehicleHandler(container));
  router.post("/:id", createUpdateVehicleHandler(container));

  router.delete("/:id", createDeleteVehicleHandler(container));

  router.get("/", createListVehicleHandler(container));
  router.get("/:id", createGetVehicleHandler(container));

  return router;
};
