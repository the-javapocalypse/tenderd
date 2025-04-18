import type { ObjectId } from "mongodb";
import mongoose from "mongoose";
import type { PaginateModel, Document } from "mongoose";

type MaintenanceType =
  | "scheduled"
  | "unscheduled"
  | "preventive"
  | "corrective"
  | "inspection"
  | "other";

type MaintenanceStatus = "pending" | "in_progress" | "completed" | "cancelled";

// Replaced Part interface for maintenance
interface ReplacedPart {
  name: string;
  partNumber?: string;
  quantity: number;
  cost: number;
}

// Attachment interface for maintenance
interface Attachment {
  name: string;
  fileUrl: string;
  fileType?: string;
}

// Cost breakdown interface for maintenance
interface MaintenanceCost {
  parts: number;
  labor: number;
  tax: number;
  total: number;
}

// Service provider interface
interface ServiceProvider {
  name?: string;
  contactInfo?: string;
  location?: string;
}

// Maintenance Interface
interface Maintenance extends Document {
  _id: ObjectId;
  vehicleId: ObjectId; // Reference to the Vehicle model
  date: Date;
  type: MaintenanceType;
  description: string;
  cost?: number;
  odometerReadingKm?: number;
  status: MaintenanceStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

interface MaintenanceCreatePayload {
  vehicleId: string; // Keep as string for input, validation handles ObjectId check
  date: Date;
  type: MaintenanceType;
  description: string;
  cost?: number;
  odometerReadingKm?: number;
  status: MaintenanceStatus;
  notes?: string;
}

interface MaintenanceResponse {
  id: ObjectId;
  vehicleId: ObjectId;
  date: Date;
  type: MaintenanceType;
  description: string;
  cost?: number;
  odometerReadingKm?: number;
  status: MaintenanceStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

type MaintenanceModelCollection = {} & mongoose.Model<Maintenance> &
  PaginateModel<Maintenance>;

export {
  Maintenance,
  MaintenanceModelCollection,
  MaintenanceType,
  MaintenanceStatus,
  ReplacedPart,
  Attachment,
  MaintenanceCost,
  ServiceProvider,
  MaintenanceResponse,
  MaintenanceCreatePayload,
};
