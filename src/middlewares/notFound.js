function notFoundHandler(req, res, next) {
  // 1. تجاهل طلبات الـ static assets عشان متعملش لوج ملوش لازمة
  if (req.originalUrl.match(/\.(js|css|png|jpg|jpeg|svg|webp|ico)$/i)) {
    return res.status(404).end();
  }

  // 2. لو الطلب عايز JSON (زي API)
  if (req.accepts("json") && !req.accepts("html")) {
    return res.status(404).json({
      status: "fail",
      message: "Resource not found",
    });
  }

  // 3. لو الطلب عادي (متصفح عايز HTML)
  res.status(404).render("error", {
    layout: "layout/main",
    title: "Not Found",
    statusCode: 404,
    message: "Page Not Found",
    description:
      "The page you’re looking for might have been moved or deleted.",
  });
}

module.exports = notFoundHandler;
