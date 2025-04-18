import type {
  Vehicle,
  VehicleModelCollection,
  VehicleResponse,
} from "../types/vehicle.types";
import { CrudService } from "../../../common/services/crud.service";
import type RedisCacheService from "../../../common/services/redis-cache.service";

class VehicleService extends CrudService<Vehicle> {
  constructor(
    vehicleModel: VehicleModelCollection,
    redisCacheService: RedisCacheService
  ) {
    super({
      model: vehicleModel,
      module: "vehicle",
      redisCacheService,
      getResponse: VehicleService.getReturnValues.bind(VehicleService),
    });
  }

  private static getReturnValues(document: Vehicle): VehicleResponse {
    return {
      id: document._id,
      registrationNumber: document.registrationNumber,
      vin: document.vin,
      make: document.make,
      vehicleModel: document.vehicleModel,
      year: document.year,
      type: document.type,
      color: document.color,
      fuelType: document.fuelType,
      engineCapacityCC: document.engineCapacityCC,
      transmission: document.transmission,
      status: document.status,
      currentOdometerKm: document.currentOdometerKm,
      fuelEfficiencyKm: document.fuelEfficiencyKm,
      purchaseDate: document.purchaseDate,
      purchasePrice: document.purchasePrice,
      lastMaintenanceDate: document.lastMaintenanceDate,
      nextMaintenanceDate: document.nextMaintenanceDate,
      insurance: document.insurance,
      gpsDeviceId: document.gpsDeviceId,
      currentLocation: document.currentLocation,
      notes: document.notes,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      age: document.age,
      speed: document.speed,
    };
  }
}

export default VehicleService;
