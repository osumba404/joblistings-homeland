const db = require('../config/db');

const Proposal = {
  async create({ job_id, freelancer_id, cover_letter, proposed_budget, timeline_days }) {
    const [result] = await db.execute(
      `INSERT INTO proposals (job_id, freelancer_id, cover_letter, proposed_budget, timeline_days)
       VALUES (?, ?, ?, ?, ?)`,
      [job_id, freelancer_id, cover_letter, proposed_budget, timeline_days]
    );
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM proposals WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  async existsByJobAndFreelancer(job_id, freelancer_id) {
    const [rows] = await db.execute(
      'SELECT id FROM proposals WHERE job_id = ? AND freelancer_id = ? LIMIT 1',
      [job_id, freelancer_id]
    );
    return rows.length > 0;
  },

  async acceptProposal(proposalId, jobId) {
    // Accept the chosen proposal
    await db.execute(
      "UPDATE proposals SET status = 'accepted' WHERE id = ?",
      [proposalId]
    );
    // Reject all other proposals for the same job
    await db.execute(
      "UPDATE proposals SET status = 'rejected' WHERE job_id = ? AND id != ?",
      [jobId, proposalId]
    );
    // Close the job
    await db.execute(
      "UPDATE jobs SET status = 'closed' WHERE id = ?",
      [jobId]
    );
  },
};

module.exports = Proposal;
