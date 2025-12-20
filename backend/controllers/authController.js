const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signToken = (id, role) => {
    return jwt.sign({id, role}, process.env.SECRET_STR, {
        expiresIn: process.env.EXPIRING_DAY
    })
}


exports.signup = async(req, res) => {
    const { name, email, password } = req.body;

    try {
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

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: "fail",
            errorMessage: "Internal server error"
        });
    }
}

exports.login = async(req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if(!email ||!password){
       return res.status(400).json({message: "Please provide both email and password"});
    }

   try {
     const user = await User.findOne({email}).select('+password');

    //Check is user exists and password matches...
    if(!user || !(await user.matchPassword(password))){
       return res.status(401).json({message: "Invalid credentials."});
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
   } catch (error) {
     console.log(error);
     res.status(500).json({
        status: "fail",
        errorMessage: "Internal server error"
    });
   }
}

