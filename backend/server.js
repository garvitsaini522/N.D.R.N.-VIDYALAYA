import app from './app.js';
import { config } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { logger } from './utils/logger.js';

let server;

async function startServer() {
  try {
    // Attempt MongoDB connection
    await connectDB();
  } catch (err) {
    logger.error('Failed to establish initial MongoDB connection:', { error: err.message });
    if (config.env === 'production') {
      process.exit(1);
    }
  }

  // Start Express server
  server = app.listen(config.port, () => {
    logger.info(`Server running in [${config.env}] mode on port ${config.port}`);
    logger.info(`Health check available at: http://localhost:${config.port}/api/health`);
    logger.info(`N.D.R.N. Vidyalaya Backend API is ready.`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    logger.info(`${signal} received: closing HTTP server and database connection cleanly...`);
    if (server) {
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });
    } else {
      await disconnectDB();
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer();
