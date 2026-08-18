// backend/src/modules/startupSchool/startupSchool.controller.js
const { validationResult } = require('express-validator');
const service = require('./startupSchool.service');
const pool = require('../../config/db');

exports.listCourses = async (req, res) => {
  try {
    const courses = await service.listCourses();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Locked-module enforcement lives here: getCourseContent throws a 403 if
// prior modules aren't complete, instead of the old plain getCourseById
// that returned content regardless of progress.
exports.getCourse = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const course = await service.getCourseContent(req.user.dbId, req.params.id);
    if (!course) return res.status(404).json({ error: 'Not found' });
    res.json(course);
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
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
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
};

exports.getQuiz = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const course = await service.getCourseById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const unlocked = await service.isModuleUnlocked(req.user.dbId, req.params.id);
    if (!unlocked) return res.status(403).json({ error: 'This module is locked' });

    const questions = await service.getQuizQuestions(req.params.id, req.query.type);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.submitQuiz = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const course = await service.getCourseById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const unlocked = await service.isModuleUnlocked(req.user.dbId, req.params.id);
    if (!unlocked) return res.status(403).json({ error: 'This module is locked' });

    const result = await service.submitQuizAttempt(
      req.user.dbId,
      req.params.id,
      req.body.type,
      req.body.answers
    );
    res.status(201).json(result);
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
};

// Stopgap admin write path -- see the validator's comment. Kept in this
// controller rather than its own module since it's a small, temporary
// surface that branch 19 will likely replace entirely.
exports.createQuizQuestion = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { question_type, question_text, options, correct_option_index, order_index } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO quiz_questions (course_id, question_type, question_text, options, correct_option_index, order_index)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, course_id, question_type, question_text, options, order_index`,
      [req.params.id, question_type, question_text, JSON.stringify(options), correct_option_index, order_index || 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};