const service = require('./adminOversight.service');

exports.getAnalytics = async (req, res) => {
  try {
    res.json(await service.getAnalytics());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAuditLog = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100;
    res.json(await service.getFullAuditLog(limit));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};