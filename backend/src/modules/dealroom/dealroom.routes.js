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
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error('UNSUPPORTED_FILE_TYPE'));
    }
    cb(null, true);
  },
});

// multer errors (bad type, oversize) surface via a callback, not a thrown
// exception, so they never reach the controller's try/catch -- without this
// wrapper they'd fall through to Express's default HTML 500 handler instead
// of a clean JSON 400.
function uploadSingle(req, res, next) {
  upload.single('file')(req, res, (err) => {
    if (!err) return next();
    if (err.message === 'UNSUPPORTED_FILE_TYPE') {
      return res.status(400).json({ error: 'Unsupported file type. Allowed: PDF, DOC, DOCX, PNG, JPG.' });
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File exceeds the 25MB limit.' });
    }
    return res.status(400).json({ error: 'File upload failed.' });
  });
}

router.use(verifyJWT, attachDbUser);

router.post('/', createRoomValidator, controller.createOrGetRoom);

// /mine must be registered before /:dealRoomId, or Express matches "mine"
// as if it were a dealRoomId param and it fails the UUID validator instead
// of hitting this handler.
router.get('/mine', controller.listMine);
router.get('/:dealRoomId', dealRoomIdValidator, controller.getRoom);

router.get('/:dealRoomId/documents', dealRoomIdValidator, controller.listDocuments);
router.post('/:dealRoomId/documents', uploadSingle, uploadDocumentValidator, controller.uploadDocument);
router.get('/documents/:documentId/download', documentIdValidator, controller.downloadDocument);
router.get('/:dealRoomId/audit-log', dealRoomIdValidator, controller.getAuditLog);
router.get('/:dealRoomId/agreements', dealRoomIdValidator, controller.listAgreements);
router.post('/documents/:documentId/sign', documentIdValidator, controller.signAgreement);

module.exports = router;