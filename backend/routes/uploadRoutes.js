const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const customError = require('../utils/customError');
const protect = require('../middlewares/authMiddleware');

const router = express.Router();

require('dotenv').config();

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer setup using memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", protect, upload.single("image"), asyncErrorHandler( async(req, res, next) => {
    if(!req.file){
        return next(new customError("No file uploaded!", 400));
    }

    // Function to handle the stream upload to Cloudinary
    const streamUpload = (fileBuffer) => {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream((error, result) => {
                if(result){
                    resolve(result);
                }else{
                    reject(error);
                }
            });

            // Use streamifier to convert file buffer to a stream
            streamifier.createReadStream(fileBuffer).pipe(stream);
        })
    }

    // Call the streamUpload function
    const result = await streamUpload(req.file.buffer);

    // Respond with the uploaded image url
    res.status(200).json({
        status: "success",
        imageUrl: result.secure_url
    });
}));

module.exports = router;