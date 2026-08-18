// backend/src/modules/pitches/pitches.controller.js
const { validationResult } = require('express-validator');
const service = require('./pitches.service');

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const profileId = await service.getFounderProfileId(req.user.dbId);
    if (!profileId) {
      return res.status(403).json({ error: 'No founder profile found for this account' });
    }
    if ((req.body.status || 'SUBMITTED') === 'SUBMITTED') {
      await service.assertCanSubmit(req.user.dbId);
    }
    const pitch = await service.createPitch(profileId, req.body);
    res.status(201).json(pitch);
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
};

exports.listAll = async (req, res) => {
  try {
    const pitches = await service.listAllPitches();
    res.json(pitches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listMine = async (req, res) => {
  try {
    const profileId = await service.getFounderProfileId(req.user.dbId);
    if (!profileId) return res.json([]);
    const pitches = await service.listPitchesByProfile(profileId);
    res.json(pitches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOne = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const pitch = await service.getPitchById(req.params.id);
  if (!pitch) return res.status(404).json({ error: 'Not found' });

  const view_count = await service.recordView(req.params.id);
  res.json({ ...pitch, view_count });
};

exports.update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const pitch = await service.getPitchById(req.params.id);
    if (!pitch) return res.status(404).json({ error: 'Not found' });

    const profileId = await service.getFounderProfileId(req.user.dbId);
    if (!profileId || profileId !== pitch.profile_id) {
      return res.status(403).json({ error: 'You do not own this pitch' });
    }

    if (req.body.status === 'SUBMITTED' && pitch.status !== 'SUBMITTED') {
      await service.assertCanSubmit(req.user.dbId);
    }

    const updated = await service.updatePitch(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
};

exports.archive = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const pitch = await service.getPitchById(req.params.id);
    if (!pitch) return res.status(404).json({ error: 'Not found' });

    const profileId = await service.getFounderProfileId(req.user.dbId);
    if (!profileId || profileId !== pitch.profile_id) {
      return res.status(403).json({ error: 'You do not own this pitch' });
    }

    const archived = await service.archivePitch(req.params.id);
    res.json(archived);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.analytics = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const pitch = await service.getPitchById(req.params.id);
    if (!pitch) return res.status(404).json({ error: 'Not found' });


    const profileId = await service.getFounderProfileId(req.user.dbId);
    if (!profileId || profileId !== pitch.profile_id) {
      return res.status(403).json({ error: 'You do not own this pitch' });
    }

    res.json({
      view_count: pitch.view_count,
      status: pitch.status,
      created_at: pitch.created_at,
      updated_at: pitch.updated_at,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const pitch = await service.getPitchById(req.params.id);
    if (!pitch) return res.status(404).json({ error: 'Not found' });

    const profileId = await service.getFounderProfileId(req.user.dbId);
    const isOwner = profileId && profileId === pitch.profile_id;
    const isAdmin = req.user.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'You do not own this pitch' });
    }

    await service.deletePitch(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};