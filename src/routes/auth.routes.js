const express = require('express');
const router = express.Router();
const { redirectIfAuth } = require("../middlewares/auth.middleware");
const authController = require("../controllers/auth.controller");
const { loginLimiter } = require("../middlewares/rateLimiter");

// Login page (only for non-authenticated users)
router.get("/login", redirectIfAuth, authController.renderLoginPage);

// Login endpoint with strict rate limiting
router.post("/login", loginLimiter, authController.login);

module.exports = router;
