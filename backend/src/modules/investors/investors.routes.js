const express = require('express');
const router = express.Router();
const controller = require('./investors.controller');
const { createInvestorValidator } = require('./investors.validator');
const verifyFirebaseToken = require('../../middleware/auth.middleware');

router.post('/', verifyFirebaseToken, createInvestorValidator, controller.create);
router.get('/:id', verifyFirebaseToken, controller.get);
router.get('/', verifyFirebaseToken, controller.list);
router.put('/:id', verifyFirebaseToken, controller.update);

module.exports = router;