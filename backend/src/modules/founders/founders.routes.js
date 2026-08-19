const express = require('express');

const router = express.Router();

const controller = require('./founders.controller');

const { createFounderValidator } = require('./founders.validator');

const verifyJWT = require('../../middleware/jwt.middleware');
const attachDbUser = require('../../middleware/attachDbUser');

// Authenticate and attach the database user to every founder route
router.use(verifyJWT, attachDbUser);

// Create founder profile
router.post(
  '/',
  createFounderValidator,
  controller.create
);

// Get the currently logged-in founder's profile
router.get(
  '/me',
  controller.getMine
);

// Get a founder by profile ID
router.get(
  '/:id',
  controller.get
);

// Get all founder profiles
router.get(
  '/',
  controller.list
);

// Update a founder profile
router.put(
  '/:id',
  controller.update
);

module.exports = router;