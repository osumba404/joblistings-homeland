require('dotenv').config();
const express = require('express');
const reviewsRouter = require('./routes/reviews');

const app = express();

app.use(express.json());
app.use('/api', reviewsRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(process.env.PORT || 3000);

module.exports = app;
