import * as dotenv from 'dotenv';
dotenv.config();

const getAllowedOrigins = () => {
  return [
    'http://localhost:3030',
    'http://127.0.0.1:3030',
  ];
}

const getConfig = () => {
  return {
    env: process.env.NODE_ENV ?? 'DEV',
    isProd: process.env.NODE_ENV === 'PROD',
    sentryDsn: process.env.SENTRY_DSN ?? '',
    dbConnectionString: process.env.DB_CONNECTION_STRING ?? 'mongodb://localhost:27017',
    port: process.env.PORT ?? 3000,
    allowedOrigins: getAllowedOrigins(),
    redisConnectionString: process.env.REDIS_CONNECTION_STRING ?? 'redis://127.0.0.1:6379',
    redisPrefix: process.env.REDIS_PREFIX ?? 'backend',
  }
}

export default getConfig();