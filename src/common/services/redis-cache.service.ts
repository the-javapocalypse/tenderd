import type { RedisClientType } from "redis";
import { createClient } from "redis";

import type ExceptionHandlerService from "./exception-handler.service";

class RedisCacheService {
  private redisInstance: RedisClientType | undefined;
  private readonly cacheServicePrefix: string;
  private readonly exceptionHandlerService: ExceptionHandlerService;

  constructor({
    url,
    prefix,
    exceptionHandlerService,
  }: {
    url: string;
    prefix: string;
    exceptionHandlerService: ExceptionHandlerService;
  }) {
    this.exceptionHandlerService = exceptionHandlerService;
    this.cacheServicePrefix = prefix;
    this.initializeRedis(url);
  }

  private readonly initializeRedis = async (connString: string) => {
    const redisClient: RedisClientType = createClient({
      url: connString,
    });

    await redisClient.connect();
    console.log("RedisCacheService initialized");
    this.redisInstance = redisClient;
  };

  async get(key: string) {
    const cacheKey = `${this.cacheServicePrefix}_${key}`;
    try {
      if (!this.redisInstance) {
        throw new Error("Redis client not connected");
      }
      const value = await this.redisInstance.get(`${cacheKey}`);
      return value ? JSON.parse(value) : undefined;
    } catch (err: any) {
      return undefined;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 86400) {
    const cacheKey = `${this.cacheServicePrefix}_${key}`;
    try {
      if (!this.redisInstance) {
        throw new Error("Redis client not connected");
      }
      const serializedValue = JSON.stringify(value);
      if (ttlSeconds > 0) {
        await this.redisInstance.set(cacheKey, serializedValue, {
          EX: ttlSeconds,
        });
      } else {
        await this.redisInstance.set(cacheKey, serializedValue);
      }
      return true;
    } catch (err: any) {
      return false;
    }
  }

  async removeModule(key: string) {
    const cacheKeyPattern = `${this.cacheServicePrefix}_${key}*`;
    try {
      if (!this.redisInstance) {
        throw new Error("Redis client not connected");
      }
      const keys = await this.redisInstance.keys(cacheKeyPattern);
      if (keys.length > 0) {
        await this.redisInstance.del(keys);
      }
      return true;
    } catch (err: any) {
      return false;
    }
  }
}

export default RedisCacheService;
