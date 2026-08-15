const express = require('express');
const router = express.Router();
const controller = require('./founders.controller');
const { createFounderValidator } = require('./founders.validator');
const verifyFirebaseToken = require('../../middleware/auth.middleware');

router.post('/', verifyFirebaseToken, createFounderValidator, controller.create);
router.get('/:id', verifyFirebaseToken, controller.get);
router.get('/', verifyFirebaseToken, controller.list);
router.put('/:id', verifyFirebaseToken, controller.update);

module.exports = router;