const crypto = require("crypto");
const User = require("../models/User");
const Referral = require("../models/Referral");
const Transaction = require("../models/Transaction");
const asyncHandler = require("../utils/asyncHandler");
const { ApiError, sendSuccess } = require("../utils/apiResponse");
const {
  issueAuthTokens,
  clearAuthCookies,
  verifyRefreshToken,
  signAccessToken,
} = require("../utils/generateToken");
const env = require("../config/env");

/**
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, referralCode } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists");
  }

  let referrer = null;
  if (referralCode) {
    referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
    if (!referrer) {
      throw new ApiError(400, "Invalid referral code");
    }
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    referredBy: referrer ? referrer._id : null,
  });

  // Credit referral bonus to the referrer (pending → credited immediately
  // since signup itself is the qualifying action for this platform).
  if (referrer) {
    const bonusAmount = env.REFERRAL_BONUS_AMOUNT;

    const referral = await Referral.create({
      referrer: referrer._id,
      referee: user._id,
      bonusAmount,
      status: "credited",
      creditedAt: new Date(),
    });

    referrer.balance += bonusAmount;
    referrer.totalEarned += bonusAmount;
    referrer.referralCount += 1;
    await referrer.save();

    await Transaction.create({
      user: referrer._id,
      type: "referral_bonus",
      amount: bonusAmount,
      status: "completed",
      description: `Referral bonus for inviting ${user.name}`,
      relatedReferral: referral._id,
      balanceAfter: referrer.balance,
      reviewedAt: new Date(),
    });
  }

  const { accessToken } = issueAuthTokens(res, user);

  sendSuccess(res, 201, "Account created successfully", {
    user: user.toSafeObject(),
    accessToken,
  });
});

/**
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(403, "This account has been suspended. Contact support.");
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const { accessToken } = issueAuthTokens(res, user);

  sendSuccess(res, 200, "Logged in successfully", {
    user: user.toSafeObject(),
    accessToken,
  });
});

/**
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  clearAuthCookies(res);
  sendSuccess(res, 200, "Logged out successfully");
});

/**
 * @route   POST /api/v1/auth/refresh
 * @access  Public (requires valid refresh token cookie)
 */
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw new ApiError(401, "No refresh token provided. Please log in again.");
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    throw new ApiError(401, "Refresh token expired or invalid. Please log in again.");
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw new ApiError(401, "User not found or account suspended.");
  }

  const accessToken = signAccessToken({ id: user._id.toString(), role: user.role });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? "none" : "lax",
    domain: env.COOKIE_DOMAIN,
    path: "/",
    maxAge: 15 * 60 * 1000,
  });

  sendSuccess(res, 200, "Token refreshed successfully", { accessToken });
});

/**
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, "Current user fetched", { user: req.user.toSafeObject() });
});

/**
 * @route   PATCH /api/v1/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  clearAuthCookies(res);
  sendSuccess(res, 200, "Password changed successfully. Please log in again.");
});

/**
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 * Generates a reset token and "sends" it to the user. No email provider is
 * configured yet, so in non-production environments the reset link is
 * logged to the server console and also returned in the response body to
 * make local testing possible. In production it is only logged server-side
 * — wire up a real email provider (e.g. Nodemailer + SMTP, Resend, SES)
 * before going live and remove the token from the JSON response.
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  // Always respond with the same generic message whether or not the email
  // exists, so this endpoint can't be used to enumerate registered emails.
  const genericMessage =
    "If an account with that email exists, a password reset link has been sent.";

  if (!user) {
    return sendSuccess(res, 200, genericMessage);
  }

  const rawToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${env.CLIENT_URL}/reset-password/${rawToken}`;

  console.log(`\n🔑 Password reset link for ${user.email}:\n${resetUrl}\n`);
  // TODO: replace the console.log above with a real email send, e.g.:
  // await sendEmail({ to: user.email, subject: "Reset your password", resetUrl });

  sendSuccess(res, 200, genericMessage, !env.isProd ? { resetUrl, rawToken } : undefined);
});

/**
 * @route   POST /api/v1/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetToken +passwordResetExpires");

  if (!user) {
    throw new ApiError(400, "This password reset link is invalid or has expired");
  }

  user.password = newPassword;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();

  clearAuthCookies(res);
  sendSuccess(res, 200, "Password reset successfully. Please log in with your new password.");
});

module.exports = {
  register,
  login,
  logout,
  refresh,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
};
