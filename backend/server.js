require('dotenv').config();
const app = require('./src/app');
const db = require('./src/config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    // Verify DB connection on startup
    await db.execute('SELECT 1');
    console.log('MySQL connected successfully');

    app.listen(PORT, () => {
      console.log(`Homeland API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to MySQL:', err.message);
    process.exit(1);
  }
}

start();
