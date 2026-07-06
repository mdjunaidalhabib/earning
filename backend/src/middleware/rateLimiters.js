const rateLimit = require("express-rate-limit");

// Strict limiter for actual credential-guessing / abuse-prone endpoints only:
// login, register, forgot-password, reset-password.
// Do NOT apply this to /refresh or /me — those are silent session checks
// that fire on every app load/reload and will exhaust the limit for
// legitimate users within minutes.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});

module.exports = { authLimiter };
