const express = require('express');
const router = express.Router();
const controller = require('./founders.controller');
const { createFounderValidator } = require('./founders.validator');

router.post('/', createFounderValidator, controller.create);
router.get('/:id', controller.get);
router.get('/', controller.list);
router.put('/:id', controller.update);

module.exports = router;