const db = require('../config/db');

const RefreshToken = {
  async create(userId, token, expiresAt) {
    await db.execute(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );
  },

  async findByToken(token) {
    const [rows] = await db.execute(
      'SELECT * FROM refresh_tokens WHERE token = ? LIMIT 1',
      [token]
    );
    return rows[0] || null;
  },

  async deleteByToken(token) {
    await db.execute('DELETE FROM refresh_tokens WHERE token = ?', [token]);
  },

  async deleteByUserId(userId) {
    await db.execute('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
  },
};

module.exports = RefreshToken;
