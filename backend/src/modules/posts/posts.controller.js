const { validationResult } = require('express-validator');
const service = require('./posts.service');

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const post = await service.createPost(req.user.dbId, req.body.content);
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = parseInt(req.query.offset, 10) || 0;
    const posts = await service.listPosts(req.user.dbId, { limit, offset });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const comment = await service.addComment(req.params.id, req.user.dbId, req.body.content);
    if (!comment) return res.status(404).json({ error: 'Post not found' });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listComments = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const comments = await service.listComments(req.params.id);
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleReaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const result = await service.toggleReaction(req.params.id, req.user.dbId);
    if (!result) return res.status(404).json({ error: 'Post not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const ownerId = await service.getPostOwner(req.params.id);
    if (!ownerId) return res.status(404).json({ error: 'Not found' });
    if (ownerId !== req.user.dbId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to remove this post' });
    }
    await service.deletePost(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const ownerId = await service.getCommentOwner(req.params.commentId);
    if (!ownerId) return res.status(404).json({ error: 'Not found' });
    if (ownerId !== req.user.dbId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to remove this comment' });
    }
    await service.deleteComment(req.params.commentId);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};