const express = require('express');
const router = express.Router();

const controller = require('./adminUsers.controller');
const { userIdValidator, changeRoleValidator } = require('./adminUsers.validator');
const verifyJWT = require('../../middleware/jwt.middleware');
const attachDbUser = require('../../middleware/attachDbUser');
const requireAdmin = require('../../middleware/requireAdmin');

router.use(verifyJWT, attachDbUser, requireAdmin);

router.get('/', controller.list);
router.patch('/:id/suspend', userIdValidator, controller.suspend);
router.patch('/:id/reactivate', userIdValidator, controller.reactivate);
router.patch('/:id/role', changeRoleValidator, controller.changeRole);
router.delete('/:id', userIdValidator, controller.remove);

module.exports = router;