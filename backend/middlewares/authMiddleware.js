const User = require('../models/User');
const util = require('util');
const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    try {
        // 1. Read the token
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            const err = new Error("You are not logged in.");
            err.statusCode = 401;
            return next(err);
        }

        // 2. Validate the token
        // Use your secret string from .env
        const decodedToken = await util.promisify(jwt.verify)(token, process.env.SECRET_STR);

        // 3. Check if user still exists
        // Note: Ensure your JWT payload uses 'id' or '_id' consistently
        const user = await User.findById(decodedToken.id || decodedToken._id);
        if (!user) {
            const err = new Error('The user belonging to this token no longer exists.');
            err.statusCode = 401;
            return next(err);
        }

        // 4. Check if password was changed after token was issued
        if (user.isPasswordChanged && await user.isPasswordChanged(decodedToken.iat)) {
            const err = new Error("Password recently changed. Please login again!");
            err.statusCode = 401;
            return next(err);
        }

        // 5. Grant access
        req.user = user;
        next();
    } catch (error) {
        // Handles expired or invalid tokens
        error.statusCode = 401;
        next(error);
    }
}

module.exports = protect;