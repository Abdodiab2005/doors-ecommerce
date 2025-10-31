const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const upload = require("../middlewares/upload");
const { requireAuth } = require("../middlewares/auth.middleware");
const { apiLimiter } = require("../middlewares/rateLimiter");

router.use(requireAuth);

// Apply API rate limiting to all admin API routes
router.use('/api', apiLimiter);

// 🧩 جهّز حقول الألوان الديناميكية (لحد 10 ألوان مثلاً)
const colorFields = Array.from({ length: 10 }, (_, i) => ({
  name: `colorImages_${i}`,
}));

router.get("/dashboard", adminController.renderDashboardPage);
router.get("/products", adminController.renderProductsPage);
router.get("/logout", adminController.logout);

router.post("/api/products", upload.any(), adminController.createProduct);
router.get("/api/products", adminController.getProducts);
router.get("/api/products/:id", adminController.getProductById);

router.put(
  "/api/products/:id",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images" },
    ...colorFields, // ← دلوقتي متعرّفة قبل الاستخدام
  ]),
  adminController.updateProduct
);

router.delete("/api/products/:id", adminController.deleteProduct);

module.exports = router;
