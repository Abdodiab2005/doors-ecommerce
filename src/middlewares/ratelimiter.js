const expressRateLimit = require('express-rate-limit');

const rateLimiter = expressRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});

const loginRateLimiter = expressRateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts from this IP, please try again later.',
});

module.exports = { rateLimiter, loginRateLimiter };
