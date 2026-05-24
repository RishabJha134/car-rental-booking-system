require('dotenv').config();

const app = require('./app');
const { initializeDatabase } = require('./config/database');

const PORT = process.env.PORT || 5000;

async function startServer() {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});