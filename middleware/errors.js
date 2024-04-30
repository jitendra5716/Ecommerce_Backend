const { stack } = require("../routes");
const ErrorHandler = require("../utils/errorHandler");

module.exports = (err,req,res,next)=>{
    let error = {
        statusCode : err?.statusCode || 500,
        message:err?.message || "Internal Server Error"
    }

    if(err.name==='CastError'){
        const message = `Resource Not Found ${err?.path}`
        error = new ErrorHandler(message,404)
    }
    // Handle mongoose duplicate key error

    if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} entered!`
        error = new ErrorHandler(message,404);
    }

    // Handle wrong Jwt Error

    if(err.name === "JsonWebTokenError"){
        const message = "Json Web Token is Invalid Try Again";
        error = new ErrorHandler(message,400);
    }

    // Handle Expired Jwt Error

    if(err.name === "TokenExpiredError"){
        const message = "Json web token is Expired";
        error = new ErrorHandler(message,400);
    }

    if(err.name === "ValidationError"){
        const message = Object.values(err.errors).map((value)=>value.message);
        error = new ErrorHandler(message,400);
    }

    res.status(error.statusCode).json({
        message:error.message,
        error:err,
        stack:err?.stack
    })
};