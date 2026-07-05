const jwt = require("jsonwebtoken");
const env = require("../config/env");

/**
 * Short-lived access token carried in an httpOnly cookie (and also returned
 * in the response body so SPA clients can attach it as a Bearer header if
 * cookies are unavailable, e.g. certain in-app webviews).
 */
function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

/**
 * Long-lived refresh token used solely to mint new access tokens.
 * Never returned in the JSON body — httpOnly cookie only.
 */
function signRefreshToken(payload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

function msFromDuration(duration) {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) return 15 * 60 * 1000; // default 15 min
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return value * multipliers[unit];
}

const baseCookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? "none" : "lax",
  domain: env.COOKIE_DOMAIN,
  path: "/",
};

/**
 * Signs a fresh access + refresh token pair for a user and attaches them
 * to the response as httpOnly cookies. Returns the access token string so
 * the controller can also include it in the JSON payload.
 */
function issueAuthTokens(res, user) {
  const payload = { id: user._id.toString(), role: user.role };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  res.cookie("accessToken", accessToken, {
    ...baseCookieOptions,
    maxAge: msFromDuration(env.JWT_EXPIRES_IN),
  });

  res.cookie("refreshToken", refreshToken, {
    ...baseCookieOptions,
    maxAge: msFromDuration(env.JWT_REFRESH_EXPIRES_IN),
  });

  return { accessToken, refreshToken };
}

function clearAuthCookies(res) {
  res.clearCookie("accessToken", baseCookieOptions);
  res.clearCookie("refreshToken", baseCookieOptions);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  issueAuthTokens,
  clearAuthCookies,
};
