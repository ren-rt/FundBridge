const { body, param } = require('express-validator');

exports.createRoomValidator = [
  body('founderProfileId').isUUID(),
  body('investorProfileId').isUUID(),
];

exports.dealRoomIdValidator = [
  param('dealRoomId').isUUID(),
];

exports.uploadDocumentValidator = [
  param('dealRoomId').isUUID(),
  body('documentType').isIn(['UPLOAD', 'TEMPLATE', 'SIGNED_AGREEMENT']),
];

exports.documentIdValidator = [
  param('documentId').isUUID(),
];