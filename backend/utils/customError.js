// This custom error class is for operational error, the error which are predictable to occur
class customError extends Error{
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
        this.status = statusCode > 400 && statusCode < 500 ? "fail" : "error";
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = customError;

// Clients error ranges from status code: 400-499 and server error from 500 to 599.