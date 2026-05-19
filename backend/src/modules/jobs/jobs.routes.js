const express = require('express');
const router = express.Router();
const jobsController = require('./jobs.controller');
const { createJobRules, createProposalRules } = require('./jobs.validation');
const { verifyToken, requireRole } = require('../../middleware/auth');

// GET /api/jobs — public
router.get('/', jobsController.listJobs);

// POST /api/jobs — employer only
router.post('/', verifyToken, requireRole('employer'), createJobRules, jobsController.createJob);

// GET /api/jobs/:id — public
router.get('/:id', jobsController.getJob);

// POST /api/jobs/:id/proposals — freelancer only
router.post(
  '/:id/proposals',
  verifyToken,
  requireRole('freelancer'),
  createProposalRules,
  jobsController.submitProposal
);

// PUT /api/jobs/:id/proposals/:proposalId/accept — employer only
router.put(
  '/:id/proposals/:proposalId/accept',
  verifyToken,
  requireRole('employer'),
  jobsController.acceptProposal
);

module.exports = router;
