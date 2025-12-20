const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name!"],
        minlength: [3, "Name must be at least 3 characters."],
    },
    email: {
        type: String,
        required: [true, "Enter your email."],
        unique: true,
        lowercase: true,
        validate: [ validator.isEmail, "Please enter a valid email" ]
    },
    password: {
        type: String,
        required: [ true, "Enter your password."],
        minlength: [ 5, "Password must be atleast 5 characters long."],
        select: false, // password not returned in response
    },
    role: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer"
    },
}, 
   { timestamps: true }
);

// Password hash middleware
userSchema.pre('save', async function(next){
    if(!this.isModified('password'))  return next; // if password not changed, no need to encrypt again

    // else hashing the password before it is saved
    this.password = await bcrypt.hash(this.password, 12);
    next;
});

// Match the password entered by user to the hashed password in db..
userSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}

userSchema.methods.isPasswordChanged = async function(JWTTimeStamp){
    if(this.passwordChangedAt){
        // console.log(this.passwordChangedAt, JWTTimeStamp);
        const pswdChangedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10); //Converting data to seconds
        return JWTTimeStamp < pswdChangedTimeStamp;
    }
    return false;
}

const User = mongoose.model('user', userSchema);

module.exports = User;
