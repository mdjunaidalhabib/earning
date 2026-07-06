const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  refresh,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const {
  registerValidator,
  loginValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require("../validators/authValidator");

const validate = require("../middleware/validateMiddleware");
const { protect } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiters");

// authLimiter only guards actual credential/abuse-prone endpoints.
router.post("/register", authLimiter, registerValidator, validate, register);
router.post("/login", authLimiter, loginValidator, validate, login);
router.post("/forgot-password", authLimiter, forgotPasswordValidator, validate, forgotPassword);
router.post("/reset-password/:token", authLimiter, resetPasswordValidator, validate, resetPassword);

// Silent session checks — no rate limit, these fire on every app load.
router.post("/refresh", refresh);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.patch(
  "/change-password",
  protect,
  changePasswordValidator,
  validate,
  changePassword
);

module.exports = router;
