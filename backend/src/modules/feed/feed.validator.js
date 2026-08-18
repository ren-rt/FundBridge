
const { query, param } = require('express-validator');

exports.feedQueryValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sort').optional().isIn(['newest', 'ask_amount_high', 'ask_amount_low']),
  query('industry').optional().isString(),
  query('stage').optional().isIn(['PRE_SEED', 'SEED', 'SERIES_A', 'SERIES_B']),
];

exports.pitchIdParamValidator = [
  param('pitchId').isUUID(),
];