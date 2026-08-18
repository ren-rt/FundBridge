const { body } = require('express-validator');

exports.createFounderValidator = [
  body('full_name')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Full name is required'),

  body('bio')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Bio is required'),

  body('skills')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Skills are required'),

  body('experience')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Experience is required'),

  body('linkedin_url')
    .optional({ values: 'falsy' })
    .isURL()
    .withMessage('linkedin_url must be a valid URL'),

  body('photo_url')
    .optional({ values: 'falsy' })
    .isString(),

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
    .isIn(['PRE_SEED', 'SEED', 'SERIES_A', 'SERIES_B'])
    .withMessage('Invalid funding stage'),

  body('country')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Country is required'),

  body('region')
    .optional({ values: 'falsy' })
    .isString(),

  body('funding_amount')
    .optional({ values: 'falsy' })
    .isNumeric(),

  body('description')
    .optional({ values: 'falsy' })
    .isString(),
];