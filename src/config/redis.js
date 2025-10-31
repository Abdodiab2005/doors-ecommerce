// src/config/redis.js
const redis = require('redis');
const settings = require('./settings');
const logger = require('../utils/logger');

let redisClient = null;

/**
 * Initialize Redis client
 */
async function initRedis() {
  if (!settings.redis.enabled) {
    logger.info('Redis is disabled in configuration');
    return null;
  }

  try {
    redisClient = redis.createClient({
      socket: {
        host: settings.redis.host,
        port: settings.redis.port,
      },
      password: settings.redis.password,
      database: settings.redis.db,
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('📦 Redis connected successfully');
    });

    redisClient.on('ready', () => {
      logger.info('📦 Redis client ready');
    });

    await redisClient.connect();

    return redisClient;
  } catch (error) {
    logger.error('Failed to initialize Redis:', error);
    // Don't crash the app if Redis fails
    return null;
  }
}

/**
 * Get Redis client instance
 */
function getRedisClient() {
  return redisClient;
}

/**
 * Check if Redis is available
 */
function isRedisAvailable() {
  return redisClient !== null && redisClient.isReady;
}

/**
 * Graceful shutdown
 */
async function closeRedis() {
  if (redisClient && redisClient.isReady) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
}

module.exports = {
  initRedis,
  getRedisClient,
  isRedisAvailable,
  closeRedis,
};
