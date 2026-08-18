const express = require('express');
const router = express.Router();
const controller = require('./investors.controller');
const { createInvestorValidator } = require('./investors.validator');
const verifyJWT = require('../../middleware/jwt.middleware');
const attachDbUser = require('../../middleware/attachDbUser');

router.use(verifyJWT, attachDbUser);

router.post('/', createInvestorValidator, controller.create);
router.get('/:id', controller.get);
router.get('/', controller.list);
router.put('/:id', controller.update);

module.exports = router;