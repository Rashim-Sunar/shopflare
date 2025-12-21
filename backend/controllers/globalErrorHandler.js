const customError = require('../utils/customError');

//Development errors for developer
const devError = (res, error) => {
    res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        stackTrace: error.stack,
        error: error
    });
}

//Production error are visible to the users..
const productionError = (res, error) => {
    //Only opertional errors are returned to the user but not the internal server error.
    if(error.isOperational){
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message
        });
    }else{  //else (non-operational errror)server error has occured, so send server error (eg. email duplication error sent by mongodb).
        res.status(500).json({
            status: "error",
            message: "Seems like something went wrong. Please try later!"
        }); 
    }
}

//castError handler
const castErrorHandler = (err) => {
    const msg = `Invalid value for ${err.path}: ${err.value} !`;
    return new customError(msg, 400);
}

//Handling duplicate key error in creating a movie in database....
const keyDuplicationErrorHandler = (err) => {
    const name = err.keyValue.name;
    const msg = `A movie with name ${name} already exists. Please use another name!`;
    return new customError(msg, 400);
}

//Handling validation Error caused by mongoose validation
const validationErrorHandler = (err) => {
    let errors = Object.values(err.errors).map(data => data.message); //Extraction array of error messages..
    const errorMessage = errors.join(". ");
    const msg = `Invalid Input data:  ${errorMessage}`;
    return new customError(msg, 400); //making a operational error using global error handling...
}

const handleExpiredJWT = (err) => {
    return new customError("JWT has expired. Please login again!", 401);
}

const handleJWTError = (err) => {
    return new customError("Invalid token. Please login again!", 401);
}

module.exports = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    if(process.env.NODE_ENV === 'development'){
        devError(res, error);
    }else if(process.env.NODE_ENV === 'production'){
         //Handling invalid id error
       if(error.name === "CastError") error = castErrorHandler(error);
       
       //Handling key duplication error in database...
       if(error.code === 11000) error = keyDuplicationErrorHandler(error);

       //Handling validation error caused by mongoose validation..
       if(error.name === "ValidationError") error = validationErrorHandler(error);

       if(error.name === "TokenExpiredError") error = handleExpiredJWT(error);

       if(error.name === "JsonWebTokenError") error = handleJWTError(error);
 
       productionError(res, error);
    }
}