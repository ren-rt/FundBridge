const express = require('express');
const router = express.Router();

const controller = require('./startupSchool.controller');
const {
  courseIdValidator,
  createCourseValidator,
  quizTypeQueryValidator,
  submitQuizValidator,
  createQuizQuestionValidator,
} = require('./startupSchool.validator');
const verifyJWT = require('../../middleware/jwt.middleware');
const attachDbUser = require('../../middleware/attachDbUser');
const requireAdmin = require('../../middleware/requireAdmin');

router.use(verifyJWT, attachDbUser);

router.get('/courses', controller.listCourses);
router.get('/courses/:id', courseIdValidator, controller.getCourse);
router.get('/progress', controller.getMyProgress);
router.patch(
  '/courses/:id/complete',
  courseIdValidator,
  controller.completeCourse
);

router.get('/courses/:id/quiz', quizTypeQueryValidator, controller.getQuiz);
router.post('/courses/:id/quiz/attempt', submitQuizValidator, controller.submitQuiz);

router.post(
  '/courses',
  requireAdmin,
  createCourseValidator,
  controller.createCourse
);

router.post(
  '/courses/:id/quiz-questions',
  requireAdmin,
  createQuizQuestionValidator,
  controller.createQuizQuestion
);

module.exports = router;