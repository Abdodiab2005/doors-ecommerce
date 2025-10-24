const AppError = require("../utils/AppError");

module.exports = function paginationMiddleware(req, res, next) {
  try {
    let { page, limit } = req.query;

    // تأمين وتحويل القيم
    page = parseInt(page) || 1;
    limit = 12;

    // منع أي قيم غير منطقية أو محاولات حقن
    if (page < 1 || limit < 1 || limit > 50) {
      page = 1;
      limit = 12;
    }

    req.pagination = { page, limit, skip: (page - 1) * limit };
    next();
  } catch (error) {
    console.error("Pagination middleware error:", error);
    next(new AppError("Pagination processing error", 500));
  }
};
