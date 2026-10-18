const app = require('./app');
const config = require('./config');
const { validateConfig } = require('./config');
const { getDatabase } = require('./db/database');
const { seedDatabase } = require('./db/seed');

function startServer() {
  try {
    // 1. Validate startup environment configuration
    const configCheck = validateConfig();
    if (configCheck.warnings.length > 0) {
      configCheck.warnings.forEach(warn => console.warn(`[CONFIG WARNING] ${warn}`));
    }

    // 2. Initialize database and auto-migrate tables
    const db = getDatabase();
    
    // 3. Auto-seed if database is empty
    const count = db.prepare('SELECT COUNT(*) as count FROM students').get().count;
    if (count === 0) {
      console.log('Database is empty. Seeding initial demo student records...');
      const inserted = seedDatabase(db);
      console.log(`Successfully seeded ${inserted} demo student records.`);
    }

    // 4. Start HTTP Server
    const server = app.listen(config.port, () => {
      console.log(`=======================================================`);
      console.log(`🎓 Student Management System — Backend API Server`);
      console.log(`Environment:      ${config.nodeEnv}`);
      console.log(`Listening on:     http://localhost:${config.port}`);
      console.log(`Health check:     http://localhost:${config.port}/api/health`);
      console.log(`Allowed CORS:     ${config.corsOrigins.join(', ')}`);
      console.log(`Database storage: ${config.dbPath}`);
      console.log(`=======================================================`);
    });

    // Graceful shutdown handling
    const shutdown = (signal) => {
      console.log(`\nReceived ${signal}. Gracefully shutting down HTTP server...`);
      server.close(() => {
        console.log('HTTP server closed successfully.');
        process.exit(0);
      });

      // Force shutdown after 10s timeout
      setTimeout(() => {
        console.error('Forced shutdown timeout expired.');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    return server;
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
