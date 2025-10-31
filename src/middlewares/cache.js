// src/middlewares/cache.js
const { getRedisClient, isRedisAvailable } = require('../config/redis');
const settings = require('../config/settings');
const logger = require('../utils/logger');

/**
 * Cache middleware - caches response data in Redis
 * @param {number} ttl - Time to live in seconds (optional, uses default from settings)
 * @param {function} keyGenerator - Custom key generator function (req => string)
 */
function cacheMiddleware(ttl = null, keyGenerator = null) {
  return async (req, res, next) => {
    // Skip caching if disabled or Redis not available
    if (!settings.cache.enabled || !isRedisAvailable()) {
      return next();
    }

    // Generate cache key
    const cacheKey = keyGenerator
      ? keyGenerator(req)
      : `cache:${req.method}:${req.originalUrl}`;

    try {
      const redisClient = getRedisClient();

      // Try to get cached data
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        logger.info(`Cache HIT: ${cacheKey}`);
        const parsed = JSON.parse(cachedData);
        return res.status(200).json(parsed);
      }

      logger.info(`Cache MISS: ${cacheKey}`);

      // Store original res.json function
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = function (data) {
        // Cache the data
        const cacheTTL = ttl || settings.cache.defaultTTL;
        redisClient
          .setEx(cacheKey, cacheTTL, JSON.stringify(data))
          .then(() => {
            logger.info(`Cached: ${cacheKey} (TTL: ${cacheTTL}s)`);
          })
          .catch((err) => {
            logger.error(`Failed to cache ${cacheKey}:`, err);
          });

        // Call original json function
        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next(); // Continue without caching on error
    }
  };
}

/**
 * Invalidate cache by pattern
 * @param {string} pattern - Redis key pattern (e.g., 'cache:GET:/api/products*')
 */
async function invalidateCache(pattern) {
  if (!isRedisAvailable()) {
    return;
  }

  try {
    const redisClient = getRedisClient();
    const keys = await redisClient.keys(pattern);

    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.info(`Invalidated ${keys.length} cache entries matching: ${pattern}`);
    }
  } catch (error) {
    logger.error('Failed to invalidate cache:', error);
  }
}

/**
 * Clear all cache
 */
async function clearAllCache() {
  if (!isRedisAvailable()) {
    return;
  }

  try {
    const redisClient = getRedisClient();
    await redisClient.flushDb();
    logger.info('All cache cleared');
  } catch (error) {
    logger.error('Failed to clear cache:', error);
  }
}

module.exports = {
  cacheMiddleware,
  invalidateCache,
  clearAllCache,
};
