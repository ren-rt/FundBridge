const express = require('express');
const multer = require('multer');
const router = express.Router();

const controller = require('./dealroom.controller');
const {
  createRoomValidator,
  dealRoomIdValidator,
  uploadDocumentValidator,
  documentIdValidator,
} = require('./dealroom.validator');
const verifyJWT = require('../../middleware/jwt.middleware');
const attachDbUser = require('../../middleware/attachDbUser');

// Files are held in memory only long enough to encrypt and write to disk --
// never written to disk unencrypted. 25MB cap; adjust if term sheets/decks
// need more room.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

router.use(verifyJWT, attachDbUser);

router.post('/', createRoomValidator, controller.createOrGetRoom);
router.get('/:dealRoomId/documents', dealRoomIdValidator, controller.listDocuments);
router.post('/:dealRoomId/documents', upload.single('file'), uploadDocumentValidator, controller.uploadDocument);
router.get('/documents/:documentId/download', documentIdValidator, controller.downloadDocument);
router.get('/:dealRoomId/audit-log', dealRoomIdValidator, controller.getAuditLog);

module.exports = router;