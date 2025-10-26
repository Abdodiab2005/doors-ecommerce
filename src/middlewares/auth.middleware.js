// يتحقق إذا كان الأدمن داخل بالفعل
function requireAuth(req, res, next) {
  if (!req.session.admin) {
    return res.redirect("/admin/login");
  }
  next();
}

function redirectIfAuth(req, res, next) {
  console.log("Session:", req.session);
  console.log("Admin:", req.session.admin);

  if (req.session && req.session.admin) {
    return res.redirect("/admin/dashboard");
  }
  next();
}

module.exports = { requireAuth, redirectIfAuth };
