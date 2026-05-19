const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const escrowController = require('./escrow.controller');
const { verifyToken, requireRole } = require('../../middleware/auth');

// POST /api/contracts/:id/fund — employer only
router.post('/:id/fund', verifyToken, requireRole('employer'), escrowController.fund);

// POST /api/contracts/:id/deliver — freelancer only
router.post('/:id/deliver', verifyToken, requireRole('freelancer'), escrowController.deliver);

// POST /api/contracts/:id/approve — employer only
router.post('/:id/approve', verifyToken, requireRole('employer'), escrowController.approve);

// POST /api/contracts/:id/dispute — any authenticated party
router.post(
  '/:id/dispute',
  verifyToken,
  [
    body('reason')
      .trim()
      .notEmpty().withMessage('Reason is required')
      .isLength({ min: 20 }).withMessage('Reason must be at least 20 characters'),
  ],
  escrowController.dispute
);

module.exports = router;
