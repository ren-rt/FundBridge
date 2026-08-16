// backend/src/modules/adminVerification/adminVerification.validator.js
const { body, param } = require('express-validator');

exports.profileIdValidator = [
  param('id').isUUID(),
];

exports.rejectReasonValidator = [
  param('id').isUUID(),
  body('reason').isString().trim().notEmpty().isLength({ max: 500 }),
];