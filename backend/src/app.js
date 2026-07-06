const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");

const env = require("./config/env");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// --- Security & core middleware ---
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(xss());

if (!env.isProd) {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// --- Rate limiting ---
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again later.",
  },
});
app.use("/api", globalLimiter);

// --- Health check ---
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// --- Route mounting ---
// authLimiter is applied selectively inside authRoutes.js (only to
// login/register/forgot-password/reset-password), not to /refresh or /me,
// so silent session checks on app load don't get rate-limited.
app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/users", require("./routes/userRoutes"));
app.use("/api/v1/tasks", require("./routes/taskRoutes"));
app.use("/api/v1/withdrawals", require("./routes/withdrawalRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));

// --- 404 + centralized error handler (must be last) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
