const { validationResult } = require('express-validator');
const jobsService = require('./jobs.service');

function handleValidationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  return null;
}

const jobsController = {
  async listJobs(req, res, next) {
    try {
      const result = await jobsService.listJobs(req.query);
      return res.status(200).json({
        success: true,
        message: 'Jobs fetched successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async createJob(req, res, next) {
    const invalid = handleValidationErrors(req, res);
    if (invalid) return;

    try {
      const job = await jobsService.createJob(req.user.userId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Job created successfully',
        data: { job },
      });
    } catch (err) {
      next(err);
    }
  },

  async getJob(req, res, next) {
    try {
      const job = await jobsService.getJob(Number(req.params.id));
      return res.status(200).json({
        success: true,
        message: 'Job fetched successfully',
        data: { job },
      });
    } catch (err) {
      next(err);
    }
  },

  async submitProposal(req, res, next) {
    const invalid = handleValidationErrors(req, res);
    if (invalid) return;

    try {
      const proposal = await jobsService.submitProposal(
        Number(req.params.id),
        req.user.userId,
        req.body
      );
      return res.status(201).json({
        success: true,
        message: 'Proposal submitted successfully',
        data: { proposal },
      });
    } catch (err) {
      next(err);
    }
  },

  async acceptProposal(req, res, next) {
    try {
      const contract = await jobsService.acceptProposal(
        Number(req.params.id),
        Number(req.params.proposalId),
        req.user.userId
      );
      return res.status(200).json({
        success: true,
        message: 'Proposal accepted. Contract created.',
        data: { contract },
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = jobsController;
