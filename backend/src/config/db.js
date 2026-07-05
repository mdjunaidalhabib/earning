const mongoose = require("mongoose");
const env = require("./env");

mongoose.set("strictQuery", true);

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

async function connectWithRetry(attempt = 1) {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      dbName: env.DB_NAME,
      serverSelectionTimeoutMS: 10000,
      autoIndex: !env.isProd,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(
      `❌ MongoDB connection attempt ${attempt} failed: ${error.message}`
    );

    if (attempt >= MAX_RETRIES) {
      console.error("❌ Max MongoDB connection retries reached. Exiting.");
      process.exit(1);
    }

    console.log(`⏳ Retrying MongoDB connection in ${RETRY_DELAY_MS / 1000}s...`);
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return connectWithRetry(attempt + 1);
  }
}

function registerConnectionEvents() {
  const connection = mongoose.connection;

  connection.on("connected", () => {
    console.log("🔗 Mongoose connection established.");
  });

  connection.on("disconnected", () => {
    console.warn("⚠️  Mongoose connection lost.");
  });

  connection.on("reconnected", () => {
    console.log("🔄 Mongoose reconnected.");
  });

  connection.on("error", (err) => {
    console.error("🔥 Mongoose connection error:", err.message);
  });

  process.on("SIGINT", async () => {
    await connection.close();
    console.log("💤 MongoDB connection closed due to app termination.");
    process.exit(0);
  });
}

async function connectDB() {
  registerConnectionEvents();
  return connectWithRetry();
}

module.exports = connectDB;
