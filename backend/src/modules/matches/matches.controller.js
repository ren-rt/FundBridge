const matchesService = require('./matches.service');

exports.getMatches = async (req, res) => {
  const { founderId } = req.params;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
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