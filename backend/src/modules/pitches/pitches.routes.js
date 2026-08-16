// backend/src/modules/pitches/pitches.routes.js
const express = require('express');
const router = express.Router();

const controller = require('./pitches.controller');
const {
  pitchIdValidator,
  createPitchValidator,
  updatePitchValidator,
} = require('./pitches.validator');
const verifyJWT = require('../../middleware/jwt.middleware');
const attachDbUser = require('../../middleware/attachDbUser');

router.use(verifyFirebaseToken, attachDbUser);

router.post('/', createPitchValidator, controller.create);
router.get('/', controller.listAll);
router.get('/mine', controller.listMine); // must come before /:id
router.get('/:id', pitchIdValidator, controller.getOne);
router.patch('/:id', updatePitchValidator, controller.update);
router.delete('/:id', pitchIdValidator, controller.remove);

module.exports = router;