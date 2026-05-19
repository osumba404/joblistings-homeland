const db = require('../config/db');

const Job = {
  async create({ employer_id, title, description, category, location, budget, skills, deadline }) {
    const [result] = await db.execute(
      `INSERT INTO jobs (employer_id, title, description, category, location, budget, skills, deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [employer_id, title, description, category, location, budget, JSON.stringify(skills), deadline]
    );
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await db.execute(
      `SELECT j.*, u.name AS employer_name,
              (SELECT COUNT(*) FROM proposals p WHERE p.job_id = j.id) AS proposal_count
       FROM jobs j
       JOIN users u ON u.id = j.employer_id
       WHERE j.id = ?`,
      [id]
    );
    const job = rows[0] || null;
    if (job) job.skills = JSON.parse(job.skills);
    return job;
  },

  async findAll({ search, category, location, budget_min, budget_max, sort, page, limit }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(j.title LIKE ? OR j.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      conditions.push('j.category = ?');
      params.push(category);
    }
    if (location) {
      conditions.push('j.location = ?');
      params.push(location);
    }
    if (budget_min) {
      conditions.push('j.budget >= ?');
      params.push(Number(budget_min));
    }
    if (budget_max) {
      conditions.push('j.budget <= ?');
      params.push(Number(budget_max));
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const orderMap = {
      newest:      'j.created_at DESC',
      budget_high: 'j.budget DESC',
      budget_low:  'j.budget ASC',
    };
    const orderBy = orderMap[sort] || 'j.created_at DESC';

    const countParams = [...params];
    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) AS total FROM jobs j ${where}`,
      countParams
    );

    const [rows] = await db.execute(
      `SELECT j.*, u.name AS employer_name,
              (SELECT COUNT(*) FROM proposals p WHERE p.job_id = j.id) AS proposal_count
       FROM jobs j
       JOIN users u ON u.id = j.employer_id
       ${where}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const jobs = rows.map((j) => ({ ...j, skills: JSON.parse(j.skills) }));
    return { jobs, total };
  },
};

module.exports = Job;
