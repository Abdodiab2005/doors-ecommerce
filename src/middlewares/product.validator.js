const { query, param, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

exports.validateProductId = [
  param('id').isMongoId().withMessage('Invalid product ID format'),
];

exports.validateCategoryQuery = [
  query('category')
    .optional()
    .isIn(['main', 'inner'])
    .withMessage('Invalid category name specified'),
  query('q').optional().isString().withMessage('Invalid search query'),
];

exports.validateSlug = [
  param('slug')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Invalid slug length')
    .matches(/^[a-zA-Z0-9\-_א-ת]+$/)
    .withMessage('Invalid characters in slug'),
];

exports.checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessage = errors.array()[0].msg;
    return next(new AppError(errorMessage, 400));
  }
  next();
};
