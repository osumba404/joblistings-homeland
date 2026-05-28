const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = Router();

const validateReview = [
  body('freelancerId').isInt().withMessage('freelancerId must be an integer'),
  body('contractId').isInt().withMessage('contractId must be an integer'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('rating must be an integer between 1 and 5'),
  body('comment').isString().isLength({ min: 20 }).withMessage('comment must be at least 20 characters'),
];

router.post('/', requireAuth, validateReview, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { freelancerId, contractId, rating, comment } = req.body;
  const clientId = req.user.id;

  let conn;
  try {
    conn = await pool.getConnection();

    const [contracts] = await conn.execute(
      'SELECT id FROM contracts WHERE id = ? AND client_id = ? AND freelancer_id = ? AND status = ?',
      [contractId, clientId, freelancerId, 'approved']
    );
    if (contracts.length === 0) {
      conn.release();
      return res.status(403).json({ error: 'No approved contract found between you and this freelancer' });
    }

    const [existing] = await conn.execute(
      'SELECT id FROM reviews WHERE contract_id = ?',
      [contractId]
    );
    if (existing.length > 0) {
      conn.release();
      return res.status(409).json({ error: 'You have already reviewed this contract' });
    }

    await conn.beginTransaction();

    const [insertResult] = await conn.execute(
      'INSERT INTO reviews (client_id, freelancer_id, contract_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [clientId, freelancerId, contractId, rating, comment]
    );

    await conn.execute(
      `UPDATE users
       SET average_rating = (SELECT AVG(rating) FROM reviews WHERE freelancer_id = ?),
           total_reviews  = (SELECT COUNT(*) FROM reviews WHERE freelancer_id = ?)
       WHERE id = ?`,
      [freelancerId, freelancerId, freelancerId]
    );

    await conn.commit();

    const [reviews] = await conn.execute(
      'SELECT * FROM reviews WHERE id = ?',
      [insertResult.insertId]
    );

    const [freelancers] = await conn.execute(
      'SELECT id, name, email, average_rating, total_reviews FROM users WHERE id = ?',
      [freelancerId]
    );

    conn.release();
    return res.status(201).json({ review: reviews[0], freelancer: freelancers[0] });
  } catch (err) {
    if (conn) {
      await conn.rollback();
      conn.release();
    }
    next(err);
  }
});

router.get('/freelancers/:id/reviews', async (req, res, next) => {
  const freelancerId = parseInt(req.params.id);
  if (!Number.isInteger(freelancerId) || freelancerId <= 0) {
    return res.status(400).json({ error: 'Freelancer id must be a positive integer' });
  }

  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const offset = (page - 1) * limit;

  try {
    const [[freelancer]] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [freelancerId]
    );
    if (!freelancer) return res.status(404).json({ error: 'Freelancer not found' });

    const [[{ total }]] = await pool.execute(
      'SELECT COUNT(*) AS total FROM reviews WHERE freelancer_id = ?',
      [freelancerId]
    );

    const [reviews] = await pool.execute(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.name AS reviewer_name
       FROM reviews r
       JOIN users u ON u.id = r.client_id
       WHERE r.freelancer_id = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [freelancerId, limit, offset]
    );

    return res.status(200).json({
      freelancerId,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      reviews,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
