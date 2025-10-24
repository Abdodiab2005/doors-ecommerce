const router = require("express").Router();
const productController = require("../controllers/product.controller");
const paginationMiddleware = require("../middlewares/pagination.middleware");
const {
  validateProductId,
  checkValidation,
  validateCategoryQuery,
} = require("../middlewares/product.validator");

router.get(
  "/",
  paginationMiddleware,
  validateCategoryQuery,
  checkValidation,
  productController.getAllProducts
);
router.get(
  "/:id",
  validateProductId,
  checkValidation,
  productController.getProductById
);

router.get(
  "/api/suggest",
  paginationMiddleware,
  productController.getSuggestions
);

module.exports = router;
