const express = require('express');
const router = express.Router();
const controller = require('./founders.controller');
const { createFounderValidator } = require('./founders.validator');
const verifyJWT = require('../../middleware/jwt.middleware');

router.post('/', verifyJWT, createFounderValidator, controller.create);
router.get('/:id', verifyJWT, controller.get);
router.get('/', verifyJWT, controller.list);
router.put('/:id', verifyJWT, controller.update);

module.exports = router;