class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // زي new Error(message)

    this.statusCode = statusCode;
    // لو 4xx يبقى 'fail' (متوقع)، لو 5xx يبقى 'error' (غير متوقع)
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // عشان نميز أخطاءنا عن أخطاء السيستم

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
