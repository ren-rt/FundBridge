const { validationResult } = require('express-validator');
const founderService = require('./founders.service');

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const founder = await founderService.createFounder(req.body);
    res.status(201).json(founder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  const founder = await founderService.getFounder(req.params.id);
  if (!founder) return res.status(404).json({ error: 'Not found' });
  res.json(founder);
};

exports.list = async (req, res) => {
  const founders = await founderService.listFounders();
  res.json(founders);
};

exports.update = async (req, res) => {
  const founder = await founderService.updateFounder(req.params.id, req.body);
  if (!founder) return res.status(404).json({ error: 'Not found' });
  res.json(founder);
};