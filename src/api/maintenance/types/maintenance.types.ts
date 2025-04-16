import type { ObjectId } from "mongodb";
import mongoose from "mongoose";
import type { PaginateModel } from "mongoose";

type MaintenanceType =
  | "routine"
  | "repair"
  | "inspection"
  | "emergency"
  | "recall"
  | "other";
type MaintenanceStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

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
interface Maintenance {
  _id?: string;
  vehicle: string; // ID reference to Vehicle
  type: MaintenanceType;
  title: string;
  description?: string;
  performedDate: Date;
  odometerReadingKm: number;
  cost: MaintenanceCost;
  provider?: ServiceProvider;
  performedBy?: string;
  status: MaintenanceStatus;
  partsReplaced?: ReplacedPart[];
  attachments?: Attachment[];
  followUpNeeded: boolean;
  followUpDate?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
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
};
