const { validationResult } = require('express-validator');
const service = require('./dealroom.service');

exports.createOrGetRoom = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const room = await service.ensureDealRoom(req.body.founderProfileId, req.body.investorProfileId);
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadDocument = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { dealRoomId } = req.params;

    const allowed = await service.isParticipant(dealRoomId, req.user.dbId);
    if (!allowed) return res.status(403).json({ error: 'Not a participant in this deal room' });

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const doc = await service.uploadDocument({
      dealRoomId,
      uploadedByUserId: req.user.dbId,
      documentType: req.body.documentType,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      buffer: req.file.buffer,
    });

    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listDocuments = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { dealRoomId } = req.params;

    const allowed = await service.isParticipant(dealRoomId, req.user.dbId);
    if (!allowed) return res.status(403).json({ error: 'Not a participant in this deal room' });

    const docs = await service.listDocuments(dealRoomId);
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.downloadDocument = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { documentId } = req.params;

    const result = await service.downloadDocument(documentId, req.user.dbId);
    if (!result) return res.status(404).json({ error: 'Document not found' });

    res.set('Content-Type', result.mimeType || 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename="${result.fileName}"`);
    res.send(result.buffer);
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
};

exports.getAuditLog = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { dealRoomId } = req.params;

    const allowed = await service.isParticipant(dealRoomId, req.user.dbId);
    if (!allowed) return res.status(403).json({ error: 'Not a participant in this deal room' });

    const log = await service.getAuditLog(dealRoomId);
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};