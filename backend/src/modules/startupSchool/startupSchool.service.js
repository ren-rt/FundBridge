// backend/src/modules/startupSchool/startupSchool.service.js
const pool = require('../../config/db');

const PASS_THRESHOLD = 0.7;

async function listCourses() {
  const { rows } = await pool.query(
    `SELECT * FROM courses ORDER BY module_order ASC`
  );
  return rows;
}

async function getCourseById(courseId) {
  const { rows } = await pool.query(
    `SELECT * FROM courses WHERE id = $1`,
    [courseId]
  );
  return rows[0] || null;
}

async function createCourse({ title, description, module_order, video_url, text_content }) {
  const { rows } = await pool.query(
    `INSERT INTO courses (title, description, module_order, video_url, text_content)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [title, description, module_order, video_url || null, text_content || null]
  );
  return rows[0];
}

// True if every course with a lower module_order than this one has been
// completed by this user. The lowest module_order is always unlocked --
// there's nothing before it to require.
async function isModuleUnlocked(userId, courseId) {
  const { rows } = await pool.query(
    `SELECT
       c.module_order,
       NOT EXISTS (
         SELECT 1 FROM courses prior
         WHERE prior.module_order < c.module_order
           AND NOT EXISTS (
             SELECT 1 FROM user_progress up
             WHERE up.course_id = prior.id AND up.user_id = $2 AND up.completed_at IS NOT NULL
           )
       ) AS unlocked
     FROM courses c
     WHERE c.id = $1`,
    [courseId, userId]
  );
  return rows[0] ? rows[0].unlocked : false;
}

// Used by the "view module content" route -- throws a 403 (not a plain
// null/404) so a locked module reads distinctly from a nonexistent one.
async function getCourseContent(userId, courseId) {
  const course = await getCourseById(courseId);
  if (!course) return null;

  const unlocked = await isModuleUnlocked(userId, courseId);
  if (!unlocked) {
    const err = new Error('This module is locked until prior modules are completed');
    err.statusCode = 403;
    throw err;
  }

  return course;
}

async function getUserProgress(userId) {
  const { rows } = await pool.query(
    `SELECT
       c.id AS course_id, c.title, c.module_order, p.completed_at,
       NOT EXISTS (
         SELECT 1 FROM courses prior
         WHERE prior.module_order < c.module_order
           AND NOT EXISTS (
             SELECT 1 FROM user_progress up
             WHERE up.course_id = prior.id AND up.user_id = $1 AND up.completed_at IS NOT NULL
           )
       ) AS unlocked
     FROM courses c
     LEFT JOIN user_progress p
       ON p.course_id = c.id AND p.user_id = $1
     ORDER BY c.module_order ASC`,
    [userId]
  );
  return rows;
}

// correct_option_index is deliberately excluded -- this is the read path a
// user hits before submitting, and the answer key should never be
// reachable from the client.
async function getQuizQuestions(courseId, questionType) {
  const { rows } = await pool.query(
    `SELECT id, question_text, options, order_index
     FROM quiz_questions
     WHERE course_id = $1 AND question_type = $2
     ORDER BY order_index ASC`,
    [courseId, questionType]
  );
  return rows;
}

async function hasQuizQuestions(courseId, questionType) {
  const { rows } = await pool.query(
    `SELECT 1 FROM quiz_questions WHERE course_id = $1 AND question_type = $2 LIMIT 1`,
    [courseId, questionType]
  );
  return rows.length > 0;
}

// Grades server-side against the stored answer key -- the client only ever
// sees question text/options via getQuizQuestions, never correct_option_index.
async function submitQuizAttempt(userId, courseId, questionType, answers) {
  const { rows: questions } = await pool.query(
    `SELECT id, correct_option_index FROM quiz_questions WHERE course_id = $1 AND question_type = $2`,
    [courseId, questionType]
  );

  if (questions.length === 0) {
    const err = new Error('No quiz questions exist for this module/type');
    err.statusCode = 404;
    throw err;
  }

  const correctById = new Map(questions.map((q) => [q.id, q.correct_option_index]));
  let score = 0;
  for (const answer of answers) {
    if (correctById.has(answer.questionId) && correctById.get(answer.questionId) === answer.selectedIndex) {
      score += 1;
    }
  }

  const total = questions.length;
  const passed = score / total >= PASS_THRESHOLD;

  const { rows } = await pool.query(
    `INSERT INTO quiz_attempts (user_id, course_id, question_type, score, total, passed)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [userId, courseId, questionType, score, total, passed]
  );

  return rows[0];
}

async function hasPassedFinal(userId, courseId) {
  const { rows } = await pool.query(
    `SELECT passed FROM quiz_attempts
     WHERE user_id = $1 AND course_id = $2 AND question_type = 'FINAL'
     ORDER BY created_at DESC LIMIT 1`,
    [userId, courseId]
  );
  return rows[0] ? rows[0].passed : false;
}

// Completion now requires having passed the FINAL assessment -- but only
// for courses that actually have FINAL questions defined. Courses seeded
// before this branch (or any course an admin hasn't added a quiz to yet)
// have none, so they fall back to completing unconditionally rather than
// becoming permanently uncompletable.
async function markCourseComplete(userId, courseId) {
  const requiresQuiz = await hasQuizQuestions(courseId, 'FINAL');

  if (requiresQuiz) {
    const passed = await hasPassedFinal(userId, courseId);
    if (!passed) {
      const err = new Error('You must pass the final assessment before completing this module');
      err.statusCode = 403;
      throw err;
    }
  }

  const { rows } = await pool.query(
    `INSERT INTO user_progress (user_id, course_id, completed_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (user_id, course_id)
     DO UPDATE SET completed_at = NOW()
     RETURNING *`,
    [userId, courseId]
  );
  return rows[0];
}

// Admin-only listing that includes correct_option_index -- learners never
// reach this, only getQuizQuestions (which strips it) is exposed to them.
async function listQuizQuestionsForAdmin(courseId, questionType) {
  const { rows } = await pool.query(
    `SELECT * FROM quiz_questions WHERE course_id = $1 AND question_type = $2 ORDER BY order_index ASC`,
    [courseId, questionType]
  );
  return rows;
}

async function updateQuizQuestion(questionId, data) {
  const { question_text, options, correct_option_index, order_index } = data;
  const { rows } = await pool.query(
    `UPDATE quiz_questions SET
       question_text = COALESCE($1, question_text),
       options = COALESCE($2, options),
       correct_option_index = COALESCE($3, correct_option_index),
       order_index = COALESCE($4, order_index)
     WHERE id = $5
     RETURNING *`,
    [question_text || null, options ? JSON.stringify(options) : null, correct_option_index ?? null, order_index ?? null, questionId]
  );
  return rows[0] || null;
}

async function deleteQuizQuestion(questionId) {
  const { rows } = await pool.query(`DELETE FROM quiz_questions WHERE id = $1 RETURNING id`, [questionId]);
  return rows[0] || null;
}

module.exports = {
  listCourses,
  getCourseById,
  createCourse,
  isModuleUnlocked,
  getCourseContent,
  getUserProgress,
  getQuizQuestions,
  submitQuizAttempt,
  markCourseComplete,
  listQuizQuestionsForAdmin, 
  updateQuizQuestion,
  deleteQuizQuestion,
};