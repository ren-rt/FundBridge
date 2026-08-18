// backend/src/modules/startupSchool/startupSchool.validator.js
const { body, param, query } = require('express-validator');

exports.courseIdValidator = [
  param('id').isUUID(),
];

exports.createCourseValidator = [
  body('title').isString().trim().notEmpty(),
  body('description').optional().isString(),
  body('module_order').isInt({ min: 1 }),
  body('video_url').optional({ checkFalsy: true }).isURL(),
  body('text_content').optional().isString(),
];

exports.quizTypeQueryValidator = [
  param('id').isUUID(),
  query('type').isIn(['MID_VIDEO', 'FINAL']),
];

exports.submitQuizValidator = [
  param('id').isUUID(),
  body('type').isIn(['MID_VIDEO', 'FINAL']),
  body('answers').isArray(),
  body('answers.*.questionId').isUUID(),
  body('answers.*.selectedIndex').isInt({ min: 0 }),
];


exports.createQuizQuestionValidator = [
  param('id').isUUID(),
  body('question_type').isIn(['MID_VIDEO', 'FINAL']),
  body('question_text').isString().trim().notEmpty(),
  body('options').isArray({ min: 2 }),
  body('options.*').isString(),
  body('correct_option_index').isInt({ min: 0 }),
  body('order_index').optional().isInt({ min: 0 }),
];