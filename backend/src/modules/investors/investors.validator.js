const { body } = require('express-validator');

exports.createInvestorValidator = [
  body('user_id').isUUID(),
  body('firm_name').isString().notEmpty(),
  body('primary_domain').isString().notEmpty(),
  body('secondary_domains').optional().isArray(),
  body('stage_pref').optional().isArray(),
  body('ticket_min').optional().isNumeric(),
  body('ticket_max').optional().isNumeric(),
  body('location').isString().notEmpty(),
  body('investment_thesis').optional().isString(),
];