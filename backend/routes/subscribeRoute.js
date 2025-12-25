const express = require('express');
const Subscribe = require('../models/Subscribe')
const protect = require('../middlewares/authMiddleware');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const customError = require('../utils/customError');

const router = express.Router();

// @route POST /api/subscribe
// @desc Handle newsletter subscription
// @access PUBLIC
router.post('/', asyncErrorHandler(async(req, res, next) => {
    const { email } = req.body;
    if(!email){
        return next(new customError("Email is required!", 400));
    }
    let subscribe = await Subscribe.findOne({ email });
    if(subscribe){
        return next(new customError("Email is already subscribed!", 400));
    }

    subscribe = new Subscribe({ email });
    await subscribe.save();
    res.status(200).json({
        status: "success",
        message: "Successfully subscribed to the newsletter!"
    });
}));

module.exports = router;
