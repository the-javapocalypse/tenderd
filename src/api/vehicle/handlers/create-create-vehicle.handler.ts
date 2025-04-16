import type { RequestHandler } from "express";
import type { Container } from "../../../container";
import { z } from "zod";
import type { VehicleCreatePayload } from "../types/vehicle.types";
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

const CreateVehicleSchema = z.object({
  registrationNumber: z.string(),
  vin: z.string(),
  make: z.string(),
  vehicleModel: z.string(),
  year: z.number(),
  type: z.enum([
    "sedan",
    "suv",
    "truck",
    "van",
    "bus",
    "motorcycle",
    "other",
  ] as const),
  color: z.string().optional(),
  fuelType: z.enum([
    "petrol",
    "diesel",
    "electric",
    "hybrid",
    "cng",
    "lpg",
  ] as const),
  engineCapacityCC: z.number().optional(),
  transmission: z
    .enum(["manual", "automatic", "cvt", "amt"] as const)
    .optional(),
  status: z.enum([
    "active",
    "maintenance",
    "retired",
    "out_of_service",
  ] as const),
  purchaseDate: z.coerce.date().optional(),
  purchasePrice: z.number().optional(),
  insurance: InsuranceSchema.optional(),
  gpsDeviceId: z.string().optional(),
  currentLocation: GeoPointSchema.optional(),
  notes: z.string().optional(),
  age: z.number().optional(),
});

const createCreateVehicleHandler =
  (container: Container): RequestHandler =>
  async (req, res, next) => {
    const { validationService, apiResponseService, vehicleService } = container;
    try {
      const payload: VehicleCreatePayload = validationService.validateData(
        CreateVehicleSchema,
        req.body
      );
      const data = await vehicleService.create(payload);
      apiResponseService.sendJsonResponse(res, {
        data,
        statusCode: StatusCodes.CREATED,
      });
    } catch (error) {
      next(error);
    }
  };

export default createCreateVehicleHandler;
