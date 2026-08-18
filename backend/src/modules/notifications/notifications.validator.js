
const { param } = require('express-validator');

exports.notificationIdValidator = [
  param('id').isUUID(),
];