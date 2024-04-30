const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Check User is Authenticated or not

module.exports.isAuthenticatedUser = catchAsyncErrors(async(req,res,next)=>{
    const {token} = req.cookies;
    if(!token){
        return next(new ErrorHandler("Login first to access this resource",401))
    }
    
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next()
});

// Authorize User Roles

module.exports.authorizeRole = (...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`Role (${req.user.role}) is not allowed to access this resource`,403));
        }
        next();
    }
}


