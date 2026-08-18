const express = require('express');
const router = express.Router();
const controller = require('./investors.controller');
const { createInvestorValidator } = require('./investors.validator');
const verifyJWT = require('../../middleware/jwt.middleware');

router.post('/', verifyJWT, createInvestorValidator, controller.create);
router.get('/:id/public', verifyJWT, controller.getPublic);
router.get('/:id', verifyJWT, controller.get);
router.get('/', verifyJWT, controller.list);
router.put('/:id', verifyJWT, controller.update);

module.exports = router;