const { body, validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

exports.settingsValidationRules = [
  body("siteName").optional().isString().trim().isLength({ max: 100 }),
  body("email").optional().isEmail(),
  body("phone").optional().isString().isLength({ min: 6 }),
  body("whatsapp").optional().isString().isLength({ min: 6 }),
  body("social.facebook").optional().isURL(),
  body("social.instagram").optional().isURL(),
  body("social.twitter").optional().isURL(),
  body("social.linkedin").optional().isURL(),
  body("meta.title").optional().isString().trim().isLength({ max: 100 }),
  body("meta.description").optional().isString().trim().isLength({ max: 160 }),
];

exports.checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessage = errors.array()[0].msg;
    return next(new AppError(errorMessage, 400));
  }
  next();
};
