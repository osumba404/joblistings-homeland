const db = require('../config/db');

const Contract = {
  async create({ job_id, proposal_id, employer_id, freelancer_id, agreed_budget }) {
    const [result] = await db.execute(
      `INSERT INTO contracts (job_id, proposal_id, employer_id, freelancer_id, agreed_budget)
       VALUES (?, ?, ?, ?, ?)`,
      [job_id, proposal_id, employer_id, freelancer_id, agreed_budget]
    );
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await db.execute(
      `SELECT c.*,
              e.name AS employer_name,
              f.name AS freelancer_name
       FROM contracts c
       JOIN users e ON e.id = c.employer_id
       JOIN users f ON f.id = c.freelancer_id
       WHERE c.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async setFunded(id, mpesaReceipt) {
    await db.execute(
      `UPDATE contracts SET status = 'funded', mpesa_receipt = ?, funded_at = NOW() WHERE id = ?`,
      [mpesaReceipt, id]
    );
  },

  async setDelivered(id) {
    await db.execute(
      `UPDATE contracts SET status = 'delivered', delivered_at = NOW() WHERE id = ?`,
      [id]
    );
  },

  async setReleased(id) {
    await db.execute(
      `UPDATE contracts SET status = 'released', released_at = NOW() WHERE id = ?`,
      [id]
    );
  },

  async setDisputed(id) {
    await db.execute(
      `UPDATE contracts SET status = 'disputed' WHERE id = ?`,
      [id]
    );
  },

  async findDeliveredOlderThan(days) {
    const [rows] = await db.execute(
      `SELECT * FROM contracts
       WHERE status = 'delivered'
         AND delivered_at <= NOW() - INTERVAL ? DAY`,
      [days]
    );
    return rows;
  },
};

module.exports = Contract;
