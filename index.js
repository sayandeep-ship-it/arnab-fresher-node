require('dotenv').config();

const app = require('./app');

const sequelize = require('./config/database.js');

require('./cron/notificationCron');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();

    console.log('Database connected successfully');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error);

    process.exit(1);
  }
}

startServer();
