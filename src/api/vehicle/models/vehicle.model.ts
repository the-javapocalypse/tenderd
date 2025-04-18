import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { Vehicle, VehicleModelCollection } from "../types/vehicle.types";
import { boolean } from "zod";

const vehicleSchema = new Schema(
  {
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    vin: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    make: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleModel: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["sedan", "suv", "truck", "van", "bus", "motorcycle", "other"],
      required: true,
    },
    color: {
      type: String,
      trim: true,
    },
    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "electric", "hybrid", "cng", "lpg"],
      required: true,
    },
    engineCapacityCC: {
      type: Number,
    },
    transmission: {
      type: String,
      enum: ["manual", "automatic", "cvt", "amt"],
    },
    status: {
      type: String,
      enum: ["active", "maintenance", "retired", "out_of_service"],
      default: "active",
      required: true,
    },
    currentOdometerKm: {
      type: Number,
      default: 0,
      required: true,
    },
    fuelEfficiencyKm: {
      type: Number,
    },
    purchaseDate: {
      type: Date,
    },
    purchasePrice: {
      type: Number,
    },
    lastMaintenanceDate: {
      type: Date,
    },
    nextMaintenanceDate: {
      type: Date,
    },
    maintenanceHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Maintenance",
      },
    ],
    insurance: {
      provider: String,
      policyNumber: String,
      coverageType: String,
      startDate: Date,
      endDate: Date,
      premium: Number,
    },
    gpsDeviceId: {
      type: String,
    },
    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    notes: {
      type: String,
    },
    speedKm: {
      type: Number,
      default: 0,
    },
    isIgnitionOn: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
vehicleSchema.index({ currentLocation: "2dsphere" });
vehicleSchema.index({ make: 1, model: 1 });
vehicleSchema.index({ status: 1 });

// Virtual for vehicle age
vehicleSchema.virtual("age").get(function () {
  return new Date().getFullYear() - this.year;
});

// Method to check if maintenance is due
vehicleSchema.methods.isMaintenanceDue = function () {
  if (!this.nextMaintenanceDate) return false;
  return new Date() >= this.nextMaintenanceDate;
};

vehicleSchema.plugin(mongoosePaginate);

export const VehicleModel: VehicleModelCollection = mongoose.model<
  Vehicle,
  VehicleModelCollection
>("Vehicle", vehicleSchema);
