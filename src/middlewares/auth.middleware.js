// يتحقق إذا كان الأدمن داخل بالفعل
function requireAuth(req, res, next) {
  if (!req.session.admin) {
    return res.redirect("/admin/login");
  }
  next();
}

// يمنع الأدمن اللي داخل من الدخول لصفحة تسجيل الدخول مرة تانية
function redirectIfAuth(req, res, next) {
  if (req.session.admin) {
    return res.redirect("/admin/dashboard");
  }
  next();
}

module.exports = { requireAuth, redirectIfAuth };
