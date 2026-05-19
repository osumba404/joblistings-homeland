const { validationResult } = require('express-validator');
const escrowService = require('./escrow.service');

const escrowController = {
  async fund(req, res, next) {
    try {
      const result = await escrowService.fund(Number(req.params.id), req.user.userId);
      return res.status(200).json({ success: true, message: result.message, data: result });
    } catch (err) {
      next(err);
    }
  },

  async deliver(req, res, next) {
    try {
      const result = await escrowService.deliver(Number(req.params.id), req.user.userId);
      return res.status(200).json({ success: true, message: result.message, data: result });
    } catch (err) {
      next(err);
    }
  },

  async approve(req, res, next) {
    try {
      const result = await escrowService.approveAndRelease(Number(req.params.id), req.user.userId);
      return res.status(200).json({ success: true, message: result.message, data: result });
    } catch (err) {
      next(err);
    }
  },

  async dispute(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }

    try {
      const result = await escrowService.dispute(
        Number(req.params.id),
        req.user.userId,
        req.body.reason
      );
      return res.status(200).json({ success: true, message: result.message, data: result });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = escrowController;
