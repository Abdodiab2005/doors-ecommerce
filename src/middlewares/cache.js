// src/middlewares/cache.js
// Cache middleware using node-cache (in-memory)
const cache = require('../utils/cache');
const logger = require('../utils/logger');

/**
 * Cache middleware - caches response data in memory
 * @param {number} ttl - Time to live in seconds (optional)
 * @param {function} keyGenerator - Custom key generator function (req => string)
 */
function cacheMiddleware(ttl = null, keyGenerator = null) {
  return async (req, res, next) => {
    // Skip caching if disabled
    if (!cache.isEnabled()) {
      return next();
    }

    // Generate cache key
    const cacheKey = keyGenerator
      ? keyGenerator(req)
      : `${req.method}:${req.originalUrl}`;

    try {
      // Try to get cached data
      const cachedData = cache.get(cacheKey);

      if (cachedData) {
        return res.status(200).json(cachedData);
      }

      // Store original res.json function
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = function (data) {
        // Cache the data
        cache.set(cacheKey, data, ttl);

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
 * @param {string} pattern - Pattern to match (e.g., 'products_*')
 */
async function invalidateCache(pattern) {
  if (!cache.isEnabled()) {
    return;
  }

  cache.deletePattern(pattern);
}

/**
 * Clear all cache
 */
async function clearAllCache() {
  if (!cache.isEnabled()) {
    return;
  }

  cache.flush();
}

module.exports = {
  cacheMiddleware,
  invalidateCache,
  clearAllCache,
};
