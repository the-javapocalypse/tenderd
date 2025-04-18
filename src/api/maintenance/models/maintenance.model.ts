import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import type {
  Maintenance,
  MaintenanceModelCollection,
} from "../types/maintenance.types";

const maintenanceSchema = new mongoose.Schema<Maintenance>(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle", // Reference to the Vehicle model
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "scheduled",
        "unscheduled",
        "preventive",
        "corrective",
        "inspection",
        "other",
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    cost: {
      type: Number,
      min: 0,
    },
    odometerReadingKm: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      required: true,
      default: "pending",
      index: true,
    },
    notes: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add pagination plugin
maintenanceSchema.plugin(mongoosePaginate);

// Add index for common query fields
maintenanceSchema.index({ vehicleId: 1, date: -1 });

export const MaintenanceModel = mongoose.model<
  Maintenance,
  MaintenanceModelCollection
>("Maintenance", maintenanceSchema);
