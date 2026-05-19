const db = require('../config/db');

const Payment = {
  async create({ contract_id, recipient_id, amount, type }) {
    const [result] = await db.execute(
      `INSERT INTO payments (contract_id, recipient_id, amount, type) VALUES (?, ?, ?, ?)`,
      [contract_id, recipient_id, amount, type]
    );
    return result.insertId;
  },

  async findByContractId(contract_id) {
    const [rows] = await db.execute(
      `SELECT p.*, u.name AS recipient_name
       FROM payments p
       JOIN users u ON u.id = p.recipient_id
       WHERE p.contract_id = ?`,
      [contract_id]
    );
    return rows;
  },
};

module.exports = Payment;
