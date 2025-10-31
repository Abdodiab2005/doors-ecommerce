const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./src/config/db");
const app = require("./src/app");
const logger = require("./src/utils/logger");
const settings = require("./src/config/settings");

const PORT = settings.server.port;

// Startup sequence
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info("✅ Database connected");

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`📝 Environment: ${settings.server.env}`);
      logger.info(`🔒 Rate limiting: enabled`);
      logger.info(`💾 Cache: ${settings.cache.enabled ? 'enabled (in-memory)' : 'disabled'}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`\n${signal} received, closing server gracefully...`);

      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
