const express = require("express");
const router = express.Router();
const { redirectIfAuth } = require("../middlewares/auth.middleware");
const authController = require("../controllers/auth.controller");

// صفحة الدخول (تظهر فقط للي مش داخل)
router.get("/login", redirectIfAuth, authController.renderLoginPage);

router.post("/login", authController.login);
module.exports = router;
