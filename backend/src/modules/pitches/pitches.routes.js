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

router.use(verifyJWT, attachDbUser);

router.post('/', createPitchValidator, controller.create);
router.get('/', controller.listAll);
router.get('/mine', controller.listMine);
router.get('/:id', pitchIdValidator, controller.getOne);
router.patch('/:id', updatePitchValidator, controller.update);
router.patch('/:id/archive', pitchIdValidator, controller.archive);
router.get('/:id/analytics', pitchIdValidator, controller.analytics);
router.delete('/:id', pitchIdValidator, controller.remove);
router.post('/:id/interest', pitchIdValidator, controller.toggleInterest);
router.get('/:id/interested', pitchIdValidator, controller.listInterestedInvestors);

module.exports = router;