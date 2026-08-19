const { validationResult } = require('express-validator');
const founderService = require('./founders.service');

exports.create = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  try {
    const founder = await founderService.createFounder({
      ...req.body,
      user_id: req.user.dbId,
    });

    res.status(201).json(founder);
  } catch (err) {
    console.error('Create founder error:', err);

    res.status(500).json({
      error: err.message,
    });
  }
};

exports.getMine = async (req, res) => {
  try {
    const founder = await founderService.getFounderByUserId(
      req.user.dbId
    );

    if (!founder) {
      return res.status(404).json({
        error: 'Founder profile not found',
      });
    }

    res.json(founder);
  } catch (err) {
    console.error('Get my founder profile error:', err);

    res.status(500).json({
      error: err.message,
    });
  }
};

exports.get = async (req, res) => {
  try {
    const founder = await founderService.getFounder(req.params.id);

    if (!founder) {
      return res.status(404).json({
        error: 'Not found',
      });
    }

    res.json(founder);
  } catch (err) {
    console.error('Get founder error:', err);

    res.status(500).json({
      error: err.message,
    });
  }
};

exports.list = async (req, res) => {
  try {
    const founders = await founderService.listFounders();

    res.json(founders);
  } catch (err) {
    console.error('List founders error:', err);

    res.status(500).json({
      error: err.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const founder = await founderService.updateFounder(
      req.params.id,
      req.body
    );

    if (!founder) {
      return res.status(404).json({
        error: 'Not found',
      });
    }

    res.json(founder);
  } catch (err) {
    console.error('Update founder error:', err);

    res.status(500).json({
      error: err.message,
    });
  }
};