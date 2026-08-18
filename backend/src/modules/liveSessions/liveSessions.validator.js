const { body, param } = require('express-validator');

exports.sessionIdValidator = [param('id').isUUID()];

exports.createSessionValidator = [
  body('title').isString().trim().notEmpty(),
  body('description').optional().isString(),
  body('scheduled_at').isISO8601(),
  body('jitsi_room_name').isString().trim().notEmpty(),
];

exports.rescheduleValidator = [
  param('id').isUUID(),
  body('scheduled_at').isISO8601(),
];