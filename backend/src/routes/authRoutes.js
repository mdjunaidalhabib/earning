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

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.post("/refresh", refresh);
router.post("/forgot-password", forgotPasswordValidator, validate, forgotPassword);
router.post("/reset-password/:token", resetPasswordValidator, validate, resetPassword);
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
