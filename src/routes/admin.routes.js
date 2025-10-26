const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const upload = require("../middlewares/upload");
const { requireAuth } = require("../middlewares/auth.middleware");

router.use(requireAuth);

router.get("/dashboard", adminController.renderDashboardPage);
router.get("/products", adminController.renderProductsPage);
router.get("/logout", adminController.logout);

router.post("/api/products", upload.any(), adminController.createProduct);
router.get("/api/products", adminController.getProducts);
router.get("/api/products/:id", adminController.getProductById);
router.put("/api/products/:id", upload.any(), adminController.updateProduct);
router.delete("/api/products/:id", adminController.deleteProduct);

module.exports = router;
