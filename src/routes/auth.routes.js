const express = require('express');
const router = express.Router();
const { redirectIfAuth } = require('../middlewares/auth.middleware');
const authController = require('../controllers/auth.controller');
const { loginRateLimiter } = require('../middlewares/ratelimiter');

// صفحة الدخول (تظهر فقط للي مش داخل)
router.get('/login', redirectIfAuth, authController.renderLoginPage);

router.post('/login', loginRateLimiter, authController.login);
module.exports = router;
