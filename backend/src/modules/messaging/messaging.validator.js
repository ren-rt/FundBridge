const { body, param } = require('express-validator');

exports.sendMessageValidator = [
  body('recipientUserId').isUUID(),
  body('content').isString().trim().notEmpty().isLength({ max: 2000 }),
];

exports.threadIdValidator = [param('threadId').isUUID()];

exports.replyValidator = [
  param('threadId').isUUID(),
  body('content').isString().trim().notEmpty().isLength({ max: 2000 }),
];