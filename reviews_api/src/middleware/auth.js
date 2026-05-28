const requireAuth = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Unauthorised - provide x-user-id header' });
  req.user = { id: parseInt(userId) };
  next();
};

module.exports = { requireAuth };
