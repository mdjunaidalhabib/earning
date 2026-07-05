const { ApiError } = require("../utils/apiResponse");

/**
 * Usage: restrictTo("admin") or restrictTo("admin", "moderator")
 * Must be used after `protect` so req.user is already populated.
 */
function restrictTo(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Not authenticated."));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(403, "You do not have permission to perform this action.")
      );
    }

    next();
  };
}

const isAdmin = restrictTo("admin");

module.exports = { restrictTo, isAdmin };
