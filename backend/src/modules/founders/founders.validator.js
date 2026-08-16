const { body } = require('express-validator');

exports.createFounderValidator = [
  body('user_id').isUUID(),
  body('company').isString().notEmpty(),
  body('industry').isString().notEmpty(),
  body('stage').isIn(['PRE_SEED', 'SEED', 'SERIES_A', 'SERIES_B']),
  body('country').isString().notEmpty(),
  body('funding_amount').optional().isNumeric(),
  body('description').optional().isString(),
];