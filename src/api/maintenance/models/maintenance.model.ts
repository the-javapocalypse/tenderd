import mongoose, { Schema } from "mongoose";
import {
  Maintenance,
  MaintenanceModelCollection,
} from "../types/maintenance.types";
import mongoosePaginate from "mongoose-paginate-v2";

const maintenanceSchema = new Schema(
  {
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["routine", "repair", "inspection", "emergency", "recall", "other"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    performedDate: {
      type: Date,
      required: true,
    },
    odometerReadingKm: {
      type: Number,
      required: true,
    },
    cost: {
      parts: {
        type: Number,
        default: 0,
      },
      labor: {
        type: Number,
        default: 0,
      },
      tax: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        default: 0,
      },
    },
    provider: {
      name: {
        type: String,
        trim: true,
      },
      contactInfo: {
        type: String,
        trim: true,
      },
      location: {
        type: String,
        trim: true,
      },
    },
    performedBy: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed", "cancelled"],
      default: "completed",
    },
    partsReplaced: [
      {
        name: String,
        partNumber: String,
        quantity: Number,
        cost: Number,
      },
    ],
    attachments: [
      {
        name: String,
        fileUrl: String,
        fileType: String,
      },
    ],
    followUpNeeded: {
      type: Boolean,
      default: false,
    },
    followUpDate: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

maintenanceSchema.pre("save", function (next) {
  if (this.cost) {
    this.cost.total = this.cost.parts + this.cost.labor + this.cost.tax;
  }
  next();
});

maintenanceSchema.index({ performedDate: -1 });
maintenanceSchema.index({ status: 1 });

maintenanceSchema.plugin(mongoosePaginate);

export const maintenanceModel: MaintenanceModelCollection = mongoose.model<
  Maintenance,
  MaintenanceModelCollection
>("Maintenance", maintenanceSchema);
