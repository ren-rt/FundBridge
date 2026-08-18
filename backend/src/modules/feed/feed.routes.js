
const express = require('express');
const router = express.Router();

const controller = require('./feed.controller');
const { feedQueryValidator, pitchIdParamValidator } = require('./feed.validator');
const verifyJWT = require('../../middleware/jwt.middleware');
const attachDbUser = require('../../middleware/attachDbUser');

router.use(verifyJWT, attachDbUser);

router.get('/bookmarks', controller.listBookmarked);
router.get('/', feedQueryValidator, controller.getFeed);
router.post('/:pitchId/bookmark', pitchIdParamValidator, controller.toggleBookmark);

module.exports = router;