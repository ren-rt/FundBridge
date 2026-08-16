// backend/src/modules/feed/feed.routes.js
const express = require('express');
const router = express.Router();

const controller = require('./feed.controller');
const { feedQueryValidator } = require('./feed.validator');
const verifyJWT = require('../../middleware/auth.middleware');
const attachDbUser = require('../../middleware/attachDbUser');

router.use(verifyJWT, attachDbUser);

router.get('/', feedQueryValidator, controller.getFeed);

module.exports = router;