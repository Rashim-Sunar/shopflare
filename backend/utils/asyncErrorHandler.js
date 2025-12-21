//Error handling for async function without using try...catch block..
module.exports = (func) => {
    return (req, res, next) => {
        func(req, res, next).catch(err => next(err)); //Calling globalErrorHandling
    }
}