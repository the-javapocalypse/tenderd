import type { ObjectId } from "mongodb";
import mongoose from "mongoose";
import type { PaginateModel, Document } from "mongoose";

type VehicleType =
  | "sedan"
  | "suv"
  | "truck"
  | "van"
  | "bus"
  | "motorcycle"
  | "other";
type FuelType = "petrol" | "diesel" | "electric" | "hybrid" | "cng" | "lpg";
type TransmissionType = "manual" | "automatic" | "cvt" | "amt";
type VehicleStatus = "active" | "maintenance" | "retired" | "out_of_service";

interface GeoPoint {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

// Insurance interface
interface Insurance {
  provider?: string;
  policyNumber?: string;
  coverageType?: string;
  startDate?: Date;
  endDate?: Date;
  premium?: number;
}

// Vehicle Interface
interface Vehicle extends Document {
  _id: ObjectId;
  registrationNumber: string;
  vin: string;
  make: string;
  vehicleModel: string;
  year: number;
  type: VehicleType;
  color?: string;
  fuelType: FuelType;
  engineCapacityCC?: number;
  transmission?: TransmissionType;
  status: VehicleStatus;
  currentOdometerKm: number;
  fuelEfficiencyKm?: number;
  purchaseDate?: Date;
  purchasePrice?: number;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  maintenanceHistory?: string[]; // Array of IDs referencing Maintenance
  insurance?: Insurance;
  gpsDeviceId?: string;
  currentLocation?: GeoPoint;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;

  // Virtual
  age?: number;
}

interface VehicleResponse {
  id?: ObjectId;
  registrationNumber: string;
  vin: string;
  make: string;
  vehicleModel: string;
  year: number;
  type: VehicleType;
  color?: string;
  fuelType: FuelType;
  engineCapacityCC?: number;
  transmission?: TransmissionType;
  status: VehicleStatus;
  currentOdometerKm: number;
  fuelEfficiencyKm?: number;
  purchaseDate?: Date;
  purchasePrice?: number;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  insurance?: Insurance;
  gpsDeviceId?: string;
  currentLocation?: GeoPoint;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;

  // Virtual
  age?: number;
}

type VehicleModelCollection = {} & mongoose.Model<Vehicle> &
  PaginateModel<Vehicle>;

export {
  Vehicle,
  VehicleModelCollection,
  VehicleType,
  FuelType,
  TransmissionType,
  VehicleStatus,
  GeoPoint,
  Insurance,
  VehicleResponse,
};
