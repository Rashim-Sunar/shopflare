const User = require('../models/User');
const util = require('util');
const jwt = require('jsonwebtoken');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const customError = require('../utils/customError');

const protect = asyncErrorHandler(async (req, res, next) => {
    // 1. Read the token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
       next(new customError("You are not logged in. Please login first", 401));
    }

    // 2. Validate the token
    const decodedToken = await util.promisify(jwt.verify)(token, process.env.SECRET_STR);

    // 3. Check if user still exists
    // Note: Ensure your JWT payload uses 'id' or '_id' consistently
    const user = await User.findById(decodedToken.id || decodedToken._id);
    if (!user) {
        const err = new customError('The user with the given token does not exist.', 401);
        next(err);
    }

    // 4. Check if password was changed after token was issued
    if (user.isPasswordChanged && await user.isPasswordChanged(decodedToken.iat)) {
        const err = new customError("Password recently changed. Please login again!", 401);
        next(err);
    }

    // 5. Grant access
    req.user = user;
    next();
});

module.exports = protect;