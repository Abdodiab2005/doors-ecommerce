// src/middlewares/rateLimiter.js
const rateLimit = require('express-rate-limit');
const settings = require('../config/settings');

/**
 * General rate limiter for all routes
 */
const generalLimiter = rateLimit(settings.rateLimit.general);

/**
 * Strict rate limiter for login attempts
 */
const loginLimiter = rateLimit(settings.rateLimit.login);

/**
 * API rate limiter
 */
const apiLimiter = rateLimit(settings.rateLimit.api);

module.exports = {
  generalLimiter,
  loginLimiter,
  apiLimiter,
};
