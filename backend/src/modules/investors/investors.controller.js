const { validationResult } = require('express-validator');
const investorService = require('./investors.service');

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const investor = await investorService.createInvestor(req.body);
    res.status(201).json(investor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  const investor = await investorService.getInvestor(req.params.id);
  if (!investor) return res.status(404).json({ error: 'Not found' });
  res.json(investor);
};

exports.getPublic = async (req, res) => {
  try {
    const investor = await investorService.getPublicInvestor(req.params.id);

    if (!investor) {
      return res.status(404).json({ error: 'Investor not found' });
    }

    res.json(investor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.list = async (req, res) => {
  const investors = await investorService.listInvestors();
  res.json(investors);
};

exports.update = async (req, res) => {
  const investor = await investorService.updateInvestor(req.params.id, req.body);
  if (!investor) return res.status(404).json({ error: 'Not found' });
  res.json(investor);
};