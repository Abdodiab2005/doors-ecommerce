const router = require('express').Router();
const productController = require('../controllers/product.controller');
const paginationMiddleware = require('../middlewares/pagination.middleware');
const {
  checkValidation,
  validateCategoryQuery,
  validateSlug,
} = require('../middlewares/product.validator');

router.get(
  '/',
  paginationMiddleware,
  validateCategoryQuery,
  checkValidation,
  productController.getAllProducts
);
router.get(
  '/:slug',
  validateSlug,
  checkValidation,
  productController.getProductBySlug
);

router.get(
  '/api/suggest',
  paginationMiddleware,
  productController.getSuggestions
);

module.exports = router;
