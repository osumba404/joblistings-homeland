const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { registerRules, loginRules, refreshRules } = require('./auth.validation');
const { verifyToken } = require('../../middleware/auth');

// POST /api/auth/register
router.post('/register', registerRules, authController.register);

// POST /api/auth/login
router.post('/login', loginRules, authController.login);

// POST /api/auth/refresh
router.post('/refresh', refreshRules, authController.refresh);

// GET /api/auth/me  — protected
router.get('/me', verifyToken, authController.me);

module.exports = router;
