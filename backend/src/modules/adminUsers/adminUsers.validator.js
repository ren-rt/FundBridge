const { param, body } = require('express-validator');

exports.userIdValidator = [param('id').isUUID()];

exports.changeRoleValidator = [
  param('id').isUUID(),
  body('role').isIn(['FOUNDER', 'INVESTOR', 'ADMIN']),
];