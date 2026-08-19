const { body } = require('express-validator');

exports.createFounderValidator = [
  body('full_name')
    .optional()
    .isString()
    .trim(),

  body('company')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Company name is required'),

  body('industry')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Industry is required'),

  body('stage')
    .isIn([
      'PRE_SEED',
      'SEED',
      'SERIES_A',
      'SERIES_B',
    ])
    .withMessage('Invalid funding stage'),

  body('country')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Country is required'),

  body('region')
    .optional()
    .isString()
    .trim(),

  body('funding_amount')
    .optional({ nullable: true })
    .isNumeric(),

  body('description')
    .optional()
    .isString(),

  body('experience')
    .optional()
    .isString(),

  body('linkedin_url')
    .optional({ nullable: true })
    .isString(),

  body('photo_url')
    .optional({ nullable: true })
    .isString(),
];