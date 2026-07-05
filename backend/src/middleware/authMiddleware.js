const asyncHandler = require("../utils/asyncHandler");
const { ApiError } = require("../utils/apiResponse");
const { verifyAccessToken } = require("../utils/generateToken");
const User = require("../models/User");

/**
 * Extracts the access token from either the httpOnly cookie (primary,
 * used by the web app) or the Authorization: Bearer header (fallback for
 * environments where cookies are blocked, e.g. some in-app webviews).
 */
function extractToken(req) {
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  return null;
}

const protect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    throw new ApiError(401, "Not authenticated. Please log in.");
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    throw new ApiError(401, "Session expired or invalid. Please log in again.");
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(401, "User belonging to this token no longer exists.");
  }

  if (!user.isActive) {
    throw new ApiError(403, "This account has been suspended. Contact support.");
  }

  if (
    user.passwordChangedAt &&
    Math.floor(user.passwordChangedAt.getTime() / 1000) > decoded.iat
  ) {
    throw new ApiError(401, "Password was recently changed. Please log in again.");
  }

  req.user = user;
  next();
});

/**
 * Optional auth — attaches req.user if a valid token is present, but does
 * not throw if absent. Useful for public endpoints with personalized data.
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);
    if (user && user.isActive) {
      req.user = user;
    }
  } catch {
    // Silently ignore invalid tokens for optional auth
  }
  next();
});

module.exports = { protect, optionalAuth };
