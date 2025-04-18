import type { RequestHandler } from "express";
import type { Container } from "../../../container";
import { z } from "zod";
import mongoose from "mongoose";
import type { MaintenanceCreatePayload } from "../types/maintenance.types";
import { StatusCodes } from "http-status-codes";

const MaintenanceCreatePayloadSchema = z.object({
  vehicleId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid Vehicle ID",
  }),
  date: z.coerce.date(),
  type: z.enum([
    "scheduled",
    "unscheduled",
    "preventive",
    "corrective",
    "inspection",
    "other",
  ] as const),
  description: z.string().min(1),
  cost: z.number().positive().optional(),
  odometerReadingKm: z.number().positive().optional(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"] as const),
  notes: z.string().optional(),
});

const createCreateMaintenanceHandler =
  (container: Container): RequestHandler =>
  async (req, res, next) => {
    const {
      validationService,
      apiResponseService,
      maintenanceService,
      vehicleService,
    } = container;
    try {
      const payload: MaintenanceCreatePayload = validationService.validateData(
        MaintenanceCreatePayloadSchema,
        req.body
      );

      // Create the maintenance record
      const data = await maintenanceService.create({
        ...payload,
        vehicleId: new mongoose.Types.ObjectId(payload.vehicleId),
      });

      // Update the vehicle's maintenanceHistory array to include this maintenance record
      const vehicleId = payload.vehicleId;
      const vehicle = await vehicleService.getById(vehicleId);

      // Update the vehicle with the new maintenance record
      await vehicleService.update(vehicleId, {
        maintenanceHistory: [...(vehicle.maintenanceHistory || []), data.id],
      });

      // Send the response
      apiResponseService.sendJsonResponse(res, {
        data,
        statusCode: StatusCodes.CREATED,
      });
    } catch (error) {
      next(error);
    }
  };

export default createCreateMaintenanceHandler;
