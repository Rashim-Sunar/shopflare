const customError = require("../utils/customError");

const restrictTo = (...roles) => {
  return (req, res, next) => {
    // protect middleware must run before this
    if (!req.user) {
      return next(new customError("User not authenticated", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new customError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};

module.exports = restrictTo;
