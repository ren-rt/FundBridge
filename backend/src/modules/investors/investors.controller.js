const { validationResult } = require('express-validator');
const investorService = require('./investors.service');


function scrubRestrictedFields(investor, req) {
  const isSelf = req.user.dbId === investor.user_id;
  const isAdmin = req.user.role === 'ADMIN';
  if (isSelf || isAdmin) return investor;

  const { verification_notes, verified_by, ...rest } = investor;
  return rest;
}

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
  res.json(scrubRestrictedFields(investor, req));
};

exports.list = async (req, res) => {
  const investors = await investorService.listInvestors();
  res.json(investors.map((inv) => scrubRestrictedFields(inv, req)));
};

exports.update = async (req, res) => {
  const investor = await investorService.updateInvestor(req.params.id, req.body);
  if (!investor) return res.status(404).json({ error: 'Not found' });
  res.json(investor);
};