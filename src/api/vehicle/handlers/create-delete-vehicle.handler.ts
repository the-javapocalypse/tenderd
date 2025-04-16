import type { NextFunction, Request, Response } from "express";
import type { Container } from "../../../container";
import { StatusCodes } from "http-status-codes";

const createDeleteVehicleHandler =
  (container: Container) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const { vehicleService, apiResponseService, validationService } = container;

    try {
      const { id } = validationService.validateIdParam(req.params);
      const data = await vehicleService.delete(id);
      apiResponseService.sendJsonResponse(res, {
        data,
        statusCode: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  };

export default createDeleteVehicleHandler;
