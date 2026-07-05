const { ApiError } = require("../utils/apiResponse");
const env = require("../config/env");

/**
 * Catches requests to routes that don't exist and forwards a 404 ApiError
 * into the centralized error handler below.
 */
function notFound(req, res, next) {
  const error = new ApiError(404, `Route not found: ${req.originalUrl}`);
  next(error);
}

/**
 * Centralized error handler. Must be registered last, after all routes.
 * Normalizes Mongoose validation/cast errors, JWT errors, duplicate key
 * errors, and custom ApiErrors into one consistent JSON response shape.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || [];

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid value for field '${err.path}': ${err.value}`;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field
      ? `${field.charAt(0).toUpperCase() + field.slice(1)} already in use`
      : "Duplicate field value";
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token has expired";
  }

  if (!env.isProd && statusCode === 500) {
    console.error("🔥 Unhandled Error:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    ...(!env.isProd && statusCode === 500 && { stack: err.stack }),
  });
}

module.exports = { notFound, errorHandler };
