const logger = require("../utils/logger");

function errorHandler(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  err.message = err.message || "Something went wrong on the server!";

  // سجل الـ Error في كل الحالات
  logger.error("💥 ERROR:", err.stack);

  // 1. لو الطلب عايز JSON (زي API)
  if (req.accepts("json") && !req.accepts("html")) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }

  // 2. لو الطلب عادي (متصفح عايز HTML)
  res.status(err.statusCode).render("error", {
    layout: "layout/main",
    title: `Error ${err.statusCode}`,
    statusCode: err.statusCode,
    message: err.message,
    description: "Something went wrong. Please try again later.",
  });
}

module.exports = errorHandler;
