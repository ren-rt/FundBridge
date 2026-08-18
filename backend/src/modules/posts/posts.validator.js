
const { body, param } = require('express-validator');

exports.createPostValidator = [
  body('content').isString().trim().notEmpty().isLength({ max: 2000 }),
];

exports.postIdValidator = [
  param('id').isUUID(),
];

exports.createCommentValidator = [
  param('id').isUUID(),
  body('content').isString().trim().notEmpty().isLength({ max: 1000 }),
];