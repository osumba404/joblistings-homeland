const { body } = require('express-validator');

const createJobRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 255 }).withMessage('Title must be between 5 and 255 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),

  body('category')
    .trim()
    .notEmpty().withMessage('Category is required'),

  body('location')
    .trim()
    .notEmpty().withMessage('Location is required'),

  body('budget')
    .notEmpty().withMessage('Budget is required')
    .isFloat({ min: 1 }).withMessage('Budget must be a positive number'),

  body('skills')
    .isArray({ min: 1 }).withMessage('Skills must be a non-empty array'),

  body('deadline')
    .notEmpty().withMessage('Deadline is required')
    .isDate().withMessage('Deadline must be a valid date (YYYY-MM-DD)')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Deadline must be in the future');
      }
      return true;
    }),
];

const createProposalRules = [
  body('cover_letter')
    .trim()
    .notEmpty().withMessage('Cover letter is required')
    .isLength({ min: 50 }).withMessage('Cover letter must be at least 50 characters'),

  body('proposed_budget')
    .notEmpty().withMessage('Proposed budget is required')
    .isFloat({ min: 1 }).withMessage('Proposed budget must be a positive number'),

  body('timeline_days')
    .notEmpty().withMessage('Timeline is required')
    .isInt({ min: 1 }).withMessage('Timeline must be a positive integer (number of days)'),
];

module.exports = { createJobRules, createProposalRules };
