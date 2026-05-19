require('dotenv').config();
const autoReleaseEscrow = require('./src/utils/autoReleaseEscrow');
autoReleaseEscrow().then(() => process.exit(0));