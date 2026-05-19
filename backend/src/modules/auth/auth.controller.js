const { validationResult } = require('express-validator');
const authService = require('./auth.service');

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

const authController = {
  async register(req, res, next) {
    const invalid = handleValidationErrors(req, res);
    if (invalid) return;

    try {
      const user = await authService.register(req.body);
      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    const invalid = handleValidationErrors(req, res);
    if (invalid) return;

    try {
      const { user, accessToken, refreshToken } = await authService.login(
        req.body.email,
        req.body.password
      );
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: { user, accessToken, refreshToken },
      });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req, res, next) {
    const invalid = handleValidationErrors(req, res);
    if (invalid) return;

    try {
      const { accessToken } = await authService.refresh(req.body.refreshToken);
      return res.status(200).json({
        success: true,
        message: 'Token refreshed',
        data: { accessToken },
      });
    } catch (err) {
      next(err);
    }
  },

  async me(req, res, next) {
    try {
      const user = await authService.getMe(req.user.userId);
      return res.status(200).json({
        success: true,
        message: 'User profile fetched',
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
