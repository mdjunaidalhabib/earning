const { validationResult } = require("express-validator");
const { ApiError } = require("../utils/apiResponse");

/**
 * Runs after an array of express-validator check() chains has executed.
 * If any validation failed, formats all errors into a single 422 response
 * instead of letting the request proceed with bad data.
 */
function validate(req, res, next) {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const formattedErrors = errors.array({ onlyFirstError: true }).map((err) => ({
    field: err.path,
    message: err.msg,
  }));

  next(new ApiError(422, "Validation failed", formattedErrors));
}

module.exports = validate;
