const express = require('express');
const router = express.Router();
const controller = require('./matches.controller');
const verifyJWT = require('../../middleware/jwt.middleware');

router.get('/:founderId', verifyJWT, controller.getMatches);

module.exports = router;