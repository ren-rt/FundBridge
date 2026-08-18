const express = require('express');
const router = express.Router();

const controller = require('./liveSessions.controller');
const { sessionIdValidator, createSessionValidator, rescheduleValidator } = require('./liveSessions.validator');
const verifyJWT = require('../../middleware/jwt.middleware');
const attachDbUser = require('../../middleware/attachDbUser');
const requireAdmin = require('../../middleware/requireAdmin');

router.use(verifyJWT, attachDbUser);

router.get('/', controller.list);
router.post('/', requireAdmin, createSessionValidator, controller.create);
router.patch('/:id/reschedule', requireAdmin, rescheduleValidator, controller.reschedule);
router.post('/:id/register', sessionIdValidator, controller.register);
router.delete('/:id/register', sessionIdValidator, controller.unregister);
router.get('/:id/join', sessionIdValidator, controller.join);

module.exports = router;