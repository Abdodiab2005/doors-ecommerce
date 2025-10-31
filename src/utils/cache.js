// src/utils/cache.js
// In-memory caching using node-cache (no external service required)
const NodeCache = require('node-cache');
const settings = require('../config/settings');
const logger = require('./logger');

// Initialize cache instance
const cache = new NodeCache({
  stdTTL: settings.cache.defaultTTL,
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false, // Better performance, but be careful with object mutations
});

// Log cache stats on startup
cache.on('set', (key) => {
  logger.info(`Cache SET: ${key}`);
});

cache.on('expired', (key) => {
  logger.info(`Cache EXPIRED: ${key}`);
});

/**
 * Get value from cache
 * @param {string} key
 * @returns {any} cached value or undefined
 */
function get(key) {
  const value = cache.get(key);
  if (value !== undefined) {
    logger.info(`Cache HIT: ${key}`);
  } else {
    logger.info(`Cache MISS: ${key}`);
  }
  return value;
}

/**
 * Set value in cache
 * @param {string} key
 * @param {any} value
 * @param {number} ttl - Time to live in seconds (optional)
 */
function set(key, value, ttl = null) {
  const success = cache.set(key, value, ttl || settings.cache.defaultTTL);
  if (success) {
    logger.info(`Cached: ${key} (TTL: ${ttl || settings.cache.defaultTTL}s)`);
  }
  return success;
}

/**
 * Delete specific key from cache
 * @param {string} key
 */
function del(key) {
  const count = cache.del(key);
  if (count > 0) {
    logger.info(`Deleted cache key: ${key}`);
  }
  return count;
}

/**
 * Delete multiple keys matching a pattern
 * @param {string} pattern - Pattern to match (e.g., 'products_*')
 */
function deletePattern(pattern) {
  const keys = cache.keys();
  const regex = new RegExp(pattern.replace(/\*/g, '.*'));
  const matchingKeys = keys.filter((key) => regex.test(key));

  if (matchingKeys.length > 0) {
    cache.del(matchingKeys);
    logger.info(`Invalidated ${matchingKeys.length} cache entries matching: ${pattern}`);
  }

  return matchingKeys.length;
}

/**
 * Clear all cache
 */
function flush() {
  cache.flushAll();
  logger.info('All cache cleared');
}

/**
 * Get cache statistics
 */
function getStats() {
  return cache.getStats();
}

/**
 * Check if caching is enabled
 */
function isEnabled() {
  return settings.cache.enabled;
}

module.exports = {
  get,
  set,
  del,
  deletePattern,
  flush,
  getStats,
  isEnabled,
};
