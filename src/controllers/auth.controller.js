const Admin = require("../models/Admin.model");

exports.renderLoginPage = (req, res) => {
  res.render("admin/login", {
    title: "Admin Login",
    layout: "layout/auth",
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  req.session.admin = admin;
  res.cookie("admin", admin._id, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
  });

  res.redirect("/admin");
};
