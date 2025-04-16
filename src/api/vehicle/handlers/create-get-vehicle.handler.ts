import type { NextFunction, Request, Response } from "express";
import type { Container } from "../../../container";
import { StatusCodes } from "http-status-codes";

const createGetVehicleHandler =
  (container: Container) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const { vehicleService, validationService, apiResponseService } = container;
    try {
      const { id } = validationService.validateIdParam(req.params);
      const data = await vehicleService.getById(id);
      apiResponseService.sendJsonResponse(res, {
        data,
        statusCode: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  };

export default createGetVehicleHandler;
