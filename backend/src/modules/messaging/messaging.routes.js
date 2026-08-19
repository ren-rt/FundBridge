const express = require('express');
const router = express.Router();

const controller = require('./messaging.controller');
const { sendMessageValidator, threadIdValidator, replyValidator } = require('./messaging.validator');
const verifyJWT = require('../../middleware/jwt.middleware');
const attachDbUser = require('../../middleware/attachDbUser');

router.use(verifyJWT, attachDbUser);

router.get('/threads', controller.listThreads);
router.post('/threads', sendMessageValidator, controller.send);
router.get('/threads/:threadId/messages', threadIdValidator, controller.getMessages);
router.post('/threads/:threadId/messages', replyValidator, controller.reply);
router.patch('/threads/:threadId/accept', threadIdValidator, controller.accept);
router.patch('/threads/:threadId/decline', threadIdValidator, controller.decline);

module.exports = router;