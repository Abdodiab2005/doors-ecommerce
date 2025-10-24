const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");

router.get("/dashboard", adminController.renderDashboardPage);
router.get("/products", adminController.renderProductsPage);
router.get("/logout", adminController.logout);

module.exports = router;
