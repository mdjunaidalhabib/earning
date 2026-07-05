class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

function sendSuccess(res, statusCode, message, data = null, meta = null) {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  if (meta !== null) payload.meta = meta;
  return res.status(statusCode).json(payload);
}

function sendError(res, statusCode, message, errors = []) {
  const payload = { success: false, message };
  if (errors && errors.length > 0) payload.errors = errors;
  return res.status(statusCode).json(payload);
}

module.exports = { ApiError, sendSuccess, sendError };
