const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const customError = require('../utils/customError');

const signToken = (id, role) => {
    return jwt.sign({id, role}, process.env.SECRET_STR, {
        expiresIn: process.env.EXPIRING_DAY
    })
}

exports.signup = asyncErrorHandler( async(req, res, next) => {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if(user) return res.status(400).json({ message: "User already exists" });
    user = new User({ name, email, password });
    await user.save();

    const token = signToken(user._id, user.role);

    res.status(201).json({
        status: "success",
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
})

exports.login = asyncErrorHandler( async(req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    if(!email ||!password){
        const err = new customError("Please provide email ID and password for login!", 400);
        return next(err);
    }

    const user = await User.findOne({email}).select('+password');

    //Check is user exists and password matches...
    if(!user || !(await user.matchPassword(password))){
       const err = new customError("Invalid credentials.", 400);
       next(err);
    }

    const token = signToken(user._id, user.role);
    res.status(200).json({
        status: "success",
        token,
         user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
})

