// backend/src/modules/startupSchool/startupSchool.controller.js
const { validationResult } = require('express-validator');
const service = require('./startupSchool.service');

exports.listCourses = async (req, res) => {
  try {
    const courses = await service.listCourses();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCourse = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const course = await service.getCourseById(req.params.id);
  if (!course) return res.status(404).json({ error: 'Not found' });
  res.json(course);
};

exports.createCourse = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const course = await service.createCourse(req.body);
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyProgress = async (req, res) => {
  try {
    const progress = await service.getUserProgress(req.user.dbId);
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.completeCourse = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const course = await service.getCourseById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const progress = await service.markCourseComplete(req.user.dbId, req.params.id);
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};