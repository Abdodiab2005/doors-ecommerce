const { body, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

exports.settingsValidationRules = [
  // Site Name (multi-language)
  body('siteName.en')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('English site name must be a string (max 100 chars)'),

  body('siteName.he')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Hebrew site name must be a string (max 100 chars)'),

  // Contact info
  body('email').optional().isEmail().withMessage('Invalid email address'),

  body('phone')
    .optional()
    .isString()
    .isLength({ min: 6 })
    .withMessage('Phone number must be at least 6 characters'),

  body('whatsapp')
    .optional()
    .isString()
    .isLength({ min: 6 })
    .withMessage('WhatsApp number must be at least 6 characters'),

  // Social links
  body('social.facebook')
    .optional()
    .isURL()
    .withMessage('Facebook must be a valid URL'),

  body('social.instagram')
    .optional()
    .isURL()
    .withMessage('Instagram must be a valid URL'),

  body('social.tiktok')
    .optional()
    .isURL()
    .withMessage('TikTok must be a valid URL'),

  body('social.twitter')
    .optional()
    .isURL()
    .withMessage('Twitter must be a valid URL'),

  // Meta fields (multi-language)
  body('metaDescription.en')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 160 })
    .withMessage('Meta description (EN) must be max 160 chars'),

  body('metaDescription.he')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 160 })
    .withMessage('Meta description (HE) must be max 160 chars'),
];

exports.checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessage = errors.array()[0].msg;
    return next(new AppError(errorMessage, 400));
  }
  next();
};
