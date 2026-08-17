const express = require('express');
const router = express.Router();

const controller = require('./startupSchool.controller');
const { courseIdValidator, createCourseValidator } = require('./startupSchool.validator');
const verifyJWT = require('../../middleware/jwt.middleware');
const attachDbUser = require('../../middleware/attachDbUser');
const requireAdmin = require('../../middleware/requireAdmin');

// Every route needs a known, verified user.
router.use(verifyJWT, attachDbUser);

// Any authenticated user can browse courses and their own progress.
router.get('/courses', controller.listCourses);
router.get('/courses/:id', courseIdValidator, controller.getCourse);
router.get('/progress', controller.getMyProgress);
router.patch(
  '/courses/:id/complete',
  courseIdValidator,
  controller.completeCourse
);

// Only admins can add new course content.
router.post(
  '/courses',
  requireAdmin,
  createCourseValidator,
  controller.createCourse
);

module.exports = router;