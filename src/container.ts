import * as Sentry from "@sentry/node";
import AppConfig from "./config/config";
import DB from "./common/services/database.service";
import ExceptionHandlerService from "./common/services/exception-handler.service";
import ValidationService from "./common/services/validation.service";
import ApiResponseHandler from "./common/services/api-response.service";

import RedisCacheService from "./common/services/redis-cache.service";

const createDatabase = async (dbConnString: string) => {
  const database = new DB(dbConnString);
  await database.connectDatabase();
  const db = {
    database,
    model: {},
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

  return {
    config,
    exceptionHandlerService,
    validationService,
    apiResponseService,
    db,
    redisCacheService,
  };
};

export type Container = Awaited<ReturnType<typeof createContainer>>;

export default createContainer;
