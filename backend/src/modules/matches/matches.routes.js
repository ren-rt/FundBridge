const express = require('express');
const router = express.Router();
const controller = require('./matches.controller');
const verifyJWT = require('../../middleware/jwt.middleware');
const attachDbUser = require('../../middleware/attachDbUser');

router.use(verifyJWT, attachDbUser);


router.get('/logs/mine', controller.getMyMatchLogs);
router.get('/investor/:investorId', controller.getMatchesForInvestor);
router.get('/:founderId', controller.getMatches);

module.exports = router;