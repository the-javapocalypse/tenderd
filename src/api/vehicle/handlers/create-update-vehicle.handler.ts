import type { NextFunction, Request, Response } from "express";
import type { Container } from "../../../container";
import { z } from "zod";
import type { VehicleUpdatePayload } from "../types/vehicle.types";
import { StatusCodes } from "http-status-codes";

const InsuranceSchema = z.object({
  provider: z.string().optional(),
  policyNumber: z.string().optional(),
  coverageType: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  premium: z.number().optional(),
});

const GeoPointSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.tuple([z.number(), z.number()]),
});

const UpdateVehicleSchema = z.object({
  registrationNumber: z.string().optional(),
  vin: z.string().optional(),
  make: z.string().optional(),
  vehicleModel: z.string().optional(),
  year: z.number().optional(),
  type: z
    .enum([
      "sedan",
      "suv",
      "truck",
      "van",
      "bus",
      "motorcycle",
      "other",
    ] as const)
    .optional(),
  color: z.string().optional(),
  fuelType: z
    .enum(["petrol", "diesel", "electric", "hybrid", "cng", "lpg"] as const)
    .optional(),
  engineCapacityCC: z.number().optional(),
  transmission: z
    .enum(["manual", "automatic", "cvt", "amt"] as const)
    .optional(),
  status: z
    .enum(["active", "maintenance", "retired", "out_of_service"] as const)
    .optional(),
  purchaseDate: z.coerce.date().optional(),
  purchasePrice: z.number().optional(),
  insurance: InsuranceSchema.optional(),
  gpsDeviceId: z.string().optional(),
  currentLocation: GeoPointSchema.optional(),
  notes: z.string().optional(),
  age: z.number().optional(),
});

const createUpdateVehicleHandler =
  (container: Container) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const { vehicleService, apiResponseService, validationService } = container;

    try {
      const { id } = validationService.validateIdParam(req.params);
      const vehicleData: VehicleUpdatePayload = validationService.validateData(
        UpdateVehicleSchema,
        req.body
      );
      const data = await vehicleService.update(id, vehicleData);
      apiResponseService.sendJsonResponse(res, {
        data,
        statusCode: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  };

export default createUpdateVehicleHandler;
