
const { validationResult } = require('express-validator');
const service = require('./feed.service');

exports.getFeed = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
    const offset = (page - 1) * limit;

    const items = await service.getFeed(limit, offset, {
      sort: req.query.sort,
      industry: req.query.industry,
      stage: req.query.stage,
      viewerUserId: req.user.dbId,
    });
    res.json({ page, limit, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleBookmark = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const result = await service.toggleBookmark(req.user.dbId, req.params.pitchId);
    if (!result) return res.status(404).json({ error: 'Pitch not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listBookmarked = async (req, res) => {
  try {
    res.json(await service.listBookmarked(req.user.dbId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};