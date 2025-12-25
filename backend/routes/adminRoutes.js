const express = require('express');
const protect = require('../middlewares/authMiddleware');
const restrictTo = require('../middlewares/roleMiddleware');
const User = require('../models/User');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const customError = require('../utils/customError');

const router = express.Router();

// @route GET /api/admin/users
// @desc Get all the users
// @access PRIVATE/ADMIN
router.get('/', protect, restrictTo("admin"), asyncErrorHandler(async(req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        status: "success",
        users
    })
}));

// @route POST /api/admin/users
// @desc Create a user
// @access PRIVATE/ADMIN
router.post('/', protect, restrictTo("admin"), asyncErrorHandler(async(req, res, next) => {
    const {
        name,
        email,
        password,
        role
    } = req.body;

    let user = await User.findOne({ email });
    if(user){
        return next(new customError("User already exists!"), 400);
    }

    user = new User({
        name,
        email,
        password,
        role: role || 'customer'
    });

    await user.save();
    res.status(200).json({
        status: "success",
        user
    });
}));

// @route   PATCH /api/admin/users/:id
// @desc    Update user (name, email, role)
// @access  PRIVATE / ADMIN
router.patch('/:id', protect, restrictTo("admin"), asyncErrorHandler(async (req, res, next) => {
    const { name, email, role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new customError("User not found", 404));
    }

    // Update allowed fields only
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();

    res.status(200).json({
      status: "success",
      user,
    });
  })
);

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  PRIVATE / ADMIN
router.delete('/:id', protect, restrictTo("admin"), asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new customError("User not found", 404));
    }

    await user.deleteOne();

    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  })
);

module.exports = router;