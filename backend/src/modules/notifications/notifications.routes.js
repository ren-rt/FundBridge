
const express = require('express');
const router = express.Router();

const controller = require('./notifications.controller');
const { notificationIdValidator } = require('./notifications.validator');
const verifyJWT = require('../../middleware/jwt.middleware');
const attachDbUser = require('../../middleware/attachDbUser');

router.use(verifyJWT, attachDbUser);


router.get('/', controller.listMine);
router.get('/unread-count', controller.unreadCount);
router.patch('/read-all', controller.markAllRead);
router.patch('/:id/read', notificationIdValidator, controller.markRead);

module.exports = router;