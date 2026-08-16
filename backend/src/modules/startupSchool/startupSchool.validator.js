// backend/src/modules/startupSchool/startupSchool.validator.js
const { body, param } = require('express-validator');

exports.courseIdValidator = [
  param('id').isUUID(),
];

exports.createCourseValidator = [
  body('title').isString().trim().notEmpty(),
  body('description').optional().isString(),
  body('module_order').isInt({ min: 1 }),
];