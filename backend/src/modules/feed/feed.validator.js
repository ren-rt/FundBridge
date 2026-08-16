// backend/src/modules/feed/feed.validator.js
const { query } = require('express-validator');

exports.feedQueryValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];