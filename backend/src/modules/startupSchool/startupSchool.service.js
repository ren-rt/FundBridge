// backend/src/modules/startupSchool/startupSchool.service.js
const pool = require('../../config/db');

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

async function createCourse({ title, description, module_order }) {
  const { rows } = await pool.query(
    `INSERT INTO courses (title, description, module_order)
     VALUES ($1, $2, $3) RETURNING *`,
    [title, description, module_order]
  );
  return rows[0];
}

async function getUserProgress(userId) {
  const { rows } = await pool.query(
    `SELECT c.id AS course_id, c.title, c.module_order, p.completed_at
     FROM courses c
     LEFT JOIN user_progress p
       ON p.course_id = c.id AND p.user_id = $1
     ORDER BY c.module_order ASC`,
    [userId]
  );
  return rows;
}

async function markCourseComplete(userId, courseId) {
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

module.exports = {
  listCourses,
  getCourseById,
  createCourse,
  getUserProgress,
  markCourseComplete,
};