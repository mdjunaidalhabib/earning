const env = require("./config/env");
const connectDB = require("./config/db");
const app = require("./app");

let server;

async function startServer() {
  try {
    await connectDB();

    server = app.listen(env.PORT, () => {
      console.log(
        `🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

// --- Graceful shutdown & unhandled error safety nets ---
process.on("unhandledRejection", (reason) => {
  console.error("🔥 Unhandled Rejection:", reason);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on("uncaughtException", (error) => {
  console.error("🔥 Uncaught Exception:", error);
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Shutting down gracefully...");
  if (server) {
    server.close(() => {
      console.log("💤 Process terminated.");
    });
  }
});

startServer();
