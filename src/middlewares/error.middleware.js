// src/middleware/errorHandler.js
const logger = require("../utils/logger");
const { error } = require("../utils/response");

module.exports = (err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // لو المسار يبدأ بـ /api → رجع JSON
  if (req.originalUrl.startsWith("/api")) {
    return error(res, message, statusCode, {
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
  }

  // غير كده → رجّع صفحة EJS
  res.status(statusCode).render("error", {
    statusCode,
    message,
    description: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
