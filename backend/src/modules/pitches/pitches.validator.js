
const { body, param } = require('express-validator');

exports.pitchIdValidator = [
  param('id').isUUID(),
];

exports.createPitchValidator = [
  body('title').isString().trim().notEmpty(),
  body('summary').isString().trim().notEmpty(),
  body('problem').optional().isString(),
  body('solution').optional().isString(),
  body('ask_amount').optional().isNumeric(),
  body('image_url').optional().isURL(),
  body('status').optional().isIn(['DRAFT', 'SUBMITTED']),
];

exports.updatePitchValidator = [
  param('id').isUUID(),
  body('title').isString().trim().notEmpty(),
  body('summary').isString().trim().notEmpty(),
  body('problem').optional().isString(),
  body('solution').optional().isString(),
  body('ask_amount').optional().isNumeric(),
  body('image_url').optional().isURL(),
  body('status').optional().isIn(['DRAFT', 'SUBMITTED']),
];