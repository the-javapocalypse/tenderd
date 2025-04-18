import * as Sentry from "@sentry/node";
import AppConfig from "./config/config";
import DB from "./common/services/database.service";
import ExceptionHandlerService from "./common/services/exception-handler.service";
import ValidationService from "./common/services/validation.service";
import ApiResponseHandler from "./common/services/api-response.service";
import VehicleService from "./api/vehicle/services/vehicle.service";
import MaintenanceService from "./api/maintenance/services/maintenance.service";
import RedisCacheService from "./common/services/redis-cache.service";
import { VehicleModel } from "./api/vehicle/models/vehicle.model";
import { MaintenanceModel } from "./api/maintenance/models/maintenance.model";
import { SocketService } from "./common/services/socket.service";

const createDatabase = async (dbConnString: string) => {
  const database = new DB(dbConnString);
  await database.connectDatabase();
  const db = {
    database,
    model: {
      vehicle: VehicleModel,
      maintenance: MaintenanceModel,
    },
  };
  return db;
};

const createContainer = async () => {
  const config = AppConfig;

  const db = await createDatabase(config.dbConnectionString);
  const exceptionHandlerService = new ExceptionHandlerService({
    sentry: Sentry,
  });
  const redisCacheService = new RedisCacheService({
    url: config.redisConnectionString,
    prefix: config.redisPrefix,
    exceptionHandlerService,
  });
  const validationService = new ValidationService();
  const apiResponseService = new ApiResponseHandler();
  const vehicleService = new VehicleService(
    db.model.vehicle,
    redisCacheService
  );
  const maintenanceService = new MaintenanceService(
    db.model.maintenance,
    redisCacheService
  );

  return {
    config,
    exceptionHandlerService,
    validationService,
    apiResponseService,
    db,
    redisCacheService,
    vehicleService,
    maintenanceService,
  };
};

// Extends the Container type to include socketService which will be added later
export type Container = Awaited<ReturnType<typeof createContainer>> & {
  socketService?: SocketService;
};

export default createContainer;
