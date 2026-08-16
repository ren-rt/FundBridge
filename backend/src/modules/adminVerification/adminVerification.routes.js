const express = require('express');
const router = express.Router();

const controller = require('./adminVerification.controller');
const {
  profileIdValidator,
  rejectReasonValidator,
} = require('./adminVerification.validator');

const verifyJWT = require('../../middleware/jwt.middleware');
const requireAdmin = require('../../middleware/requireAdmin');

// Authenticate with JWT first, then check that the user is an ADMIN.
router.use(verifyJWT, requireAdmin);

router.get('/', controller.listPending);
router.get('/:id', profileIdValidator, controller.getOne);
router.patch('/:id/approve', profileIdValidator, controller.approve);
router.patch('/:id/reject', rejectReasonValidator, controller.reject);

module.exports = router;