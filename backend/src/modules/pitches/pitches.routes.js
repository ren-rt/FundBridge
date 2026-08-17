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
router.delete('/:id', pitchIdValidator, controller.remove);

module.exports = router;