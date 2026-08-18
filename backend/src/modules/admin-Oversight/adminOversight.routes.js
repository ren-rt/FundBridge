const express = require('express');
const router = express.Router();

const controller = require('./adminOversight.controller');
const verifyJWT = require('../../middleware/jwt.middleware');
const attachDbUser = require('../../middleware/attachDbUser');
const requireAdmin = require('../../middleware/requireAdmin');

router.use(verifyJWT, attachDbUser, requireAdmin);

router.get('/analytics', controller.getAnalytics);
router.get('/audit-log', controller.getAuditLog);

module.exports = router;