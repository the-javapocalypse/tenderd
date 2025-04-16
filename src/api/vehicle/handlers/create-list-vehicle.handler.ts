import type { NextFunction, Request, Response } from "express";
import type { Container } from "../../../container";
import { StatusCodes } from "http-status-codes";

const createListVehicleHandler =
  (container: Container) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const { vehicleService, apiResponseService, validationService } = container;
    try {
      const { page, limit } = validationService.validatePaginationQuery(
        req.query
      );
      const data = await vehicleService.list(Number(page), Number(limit));
      apiResponseService.sendJsonResponse(res, {
        data,
        statusCode: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  };

export default createListVehicleHandler;
