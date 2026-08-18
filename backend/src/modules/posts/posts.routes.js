
const express = require('express');
const router = express.Router();

const controller = require('./posts.controller');
const { createPostValidator, postIdValidator, createCommentValidator } = require('./posts.validator');
const verifyJWT = require('../../middleware/jwt.middleware');
const attachDbUser = require('../../middleware/attachDbUser');

router.use(verifyJWT, attachDbUser);

router.get('/', controller.list);
router.post('/', createPostValidator, controller.create);
router.get('/:id/comments', postIdValidator, controller.listComments);
router.post('/:id/comments', createCommentValidator, controller.addComment);
router.post('/:id/react', postIdValidator, controller.toggleReaction);

module.exports = router;