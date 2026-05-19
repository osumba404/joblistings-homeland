const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../../models/User');
const RefreshToken = require('../../models/RefreshToken');

function generateAccessToken(userId, role) {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
}

function refreshTokenExpiryDate() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d;
}

const authService = {
  async register({ name, email, phone, password, role }) {
    const existing = await User.findByEmail(email);
    if (existing) {
      const err = new Error('Email already registered');
      err.status = 409;
      throw err;
    }

    const hash = await bcrypt.hash(password, 12);
    const userId = await User.create({ name, email, phone, password: hash, role });
    const user = await User.findById(userId);
    return user;
  },

  async login(email, password) {
    const user = await User.findByEmail(email);
    if (!user) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      throw err;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      throw err;
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = uuidv4();
    const expiresAt = refreshTokenExpiryDate();
    await RefreshToken.create(user.id, refreshToken, expiresAt);

    const { password: _, ...safeUser } = user;
    return { user: safeUser, accessToken, refreshToken };
  },

  async refresh(token) {
    const stored = await RefreshToken.findByToken(token);
    if (!stored) {
      const err = new Error('Invalid refresh token');
      err.status = 401;
      throw err;
    }

    if (new Date() > new Date(stored.expires_at)) {
      await RefreshToken.deleteByToken(token);
      const err = new Error('Refresh token expired. Please log in again.');
      err.status = 401;
      throw err;
    }

    const user = await User.findById(stored.user_id);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }

    const accessToken = generateAccessToken(user.id, user.role);
    return { accessToken };
  },

  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    return user;
  },
};

module.exports = authService;
