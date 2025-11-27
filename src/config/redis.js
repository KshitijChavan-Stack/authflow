import Redis from 'ioredis';
import logger from '../utils/logger.js';
// This file is used for configuring and managing Redis connections.
//Token blacklisting, rate limiting, caching

let redisClient = null;

export const connectRedis = () => {
  try {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    redisClient.on('error', (err) => {
      logger.error(`Redis connection error: ${err.message}`);
    });

    redisClient.on('ready', () => {
      logger.info('Redis is ready to use');
    });

    redisClient.on('reconnecting', () => {
      logger.warn('Redis reconnecting...');
    });

    process.on('SIGINT', async () => {
      await redisClient.quit();
      logger.info('Redis connection closed through app termination');
    });

    return redisClient;
  } catch (error) {
    logger.error(`Redis initialization failed: ${error.message}`);
    throw error;
  }
};

export const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
};
