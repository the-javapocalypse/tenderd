import type {
  Maintenance,
  MaintenanceModelCollection,
  MaintenanceResponse,
} from "../types/maintenance.types";
import { CrudService } from "../../../common/services/crud.service";
import type RedisCacheService from "../../../common/services/redis-cache.service";

class MaintenanceService extends CrudService<Maintenance> {
  constructor(
    maintenanceModel: MaintenanceModelCollection,
    redisCacheService: RedisCacheService
  ) {
    super({
      model: maintenanceModel,
      module: "maintenance",
      redisCacheService,
      getResponse: MaintenanceService.getReturnValues.bind(MaintenanceService),
    });
  }

  private static getReturnValues(document: Maintenance): MaintenanceResponse {
    return {
      id: document._id,
      vehicleId: document.vehicleId,
      date: document.date,
      type: document.type,
      description: document.description,
      cost: document.cost,
      odometerReadingKm: document.odometerReadingKm,
      status: document.status,
      notes: document.notes,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}

export default MaintenanceService;
