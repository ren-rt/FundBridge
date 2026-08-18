const matchesService = require('./matches.service');

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

exports.getMatches = async (req, res) => {
  const { founderId } = req.params;

  if (!uuidRegex.test(founderId)) {
    return res.status(400).json({ error: 'Invalid founderId format' });
  }

  try {
    const matches = await matchesService.getMatchesForFounder(founderId);
    if (matches.length === 0) {
      return res.json({ matches: [], message: 'No investors available to match against yet' });
    }
    res.json({ matches });
  } catch (err) {
    if (err.message === 'Founder not found') {
      return res.status(404).json({ error: 'Founder not found' });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.getMatchesForInvestor = async (req, res) => {
  const { investorId } = req.params;

  if (!uuidRegex.test(investorId)) {
    return res.status(400).json({ error: 'Invalid investorId format' });
  }

  try {
    const matches = await matchesService.getMatchesForInvestor(investorId);
    if (matches.length === 0) {
      return res.json({ matches: [], message: 'No submitted pitches available to match against yet' });
    }
    res.json({ matches });
  } catch (err) {
    if (err.message === 'Investor not found') {
      return res.status(404).json({ error: 'Investor not found' });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.getMyMatchLogs = async (req, res) => {
  try {
    res.json(await matchesService.getMatchLogs(req.user.dbId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};