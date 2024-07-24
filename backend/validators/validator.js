const { body, validationResult } = require("express-validator");

const validate_user = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid email address"),
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("name should be a valid string"),
  body("phone")
    .notEmpty()
    .withMessage("phone number is required")
    .isMobilePhone()
    .withMessage("Phone number should be a Number"),
  body("password").notEmpty().withMessage("password is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = validate_user;
