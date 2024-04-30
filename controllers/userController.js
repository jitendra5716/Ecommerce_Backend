const User = require('../models/user');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/sendToken');
const getResetPasswordTemplate = require('../utils/emailTemplate');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const { upload_file, delete_file } = require('../utils/cloudinary');

// Register User

module.exports.registerUser = catchAsyncErrors(async(req,res,next)=>{

    const {name,email,password} = req.body;
    const user = await User.create({name,email, password});

    const token = user.getJwtToken();

    sendToken(user,201,res);
});

// Login User & Asign Token

module.exports.loginUser = catchAsyncErrors(async(req,res,next)=>{
    const {email, password} = req.body;
    if(!email || !password){
        return next(new ErrorHandler('Please Enter Email and Password',400));
    }
    // find User in Database
    const user = await User.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHandler("Invalid Email or Password",401));
    }
    //Check Password is Correct

    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler('Invalid Email or Password',401));
    }
    
    sendToken(user,201,res);
});


// Logout User 

module.exports.logoutUser = catchAsyncErrors(async(req,res,next)=>{
    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true
    });
    res.status(200).json({
        message:"Logged Out"
    })
});

// forgot Password

module.exports.forgotPassword = catchAsyncErrors(async (req,res,next)=>{

    const user = await User.findOne( {email:req.body.email} );
    
    if(!user){
        return next(new ErrorHandler('user not found with this email',404));
    }
    
    //Get Reset Password token

    const resetToken = user.getResetPasswordToken();
    
    await user.save();

    // Create Reset Password Url

    const resetUrl = `${process.env.FRONTEND_URL}/user/password/reset/${resetToken}`

    const message = getResetPasswordTemplate(user?.name,resetUrl);

    try{
        await sendEmail({
            email:user.email,
            subject:'ShopIT Password Recovery',
            message
        });
        res.status(200).json({
            message:`Email sent to : ${user.email}`
        });
    }catch(error){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        return next(new ErrorHandler(error?.message,500));
    }
})

// Reset Password 

module.exports.resetPassword = catchAsyncErrors(async(req,res,next)=>{
    // hash the url token

    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()}
        })

    if(!user){
        return next(new ErrorHandler('Password Reset Token is Invalid or has been Expired',404));
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler('Password does not matched',400));
    }

    // set the new Password

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    sendToken(user,200,res);
});


// Get Current User Profile

module.exports.getUserProfile = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req?.user?._id);

    res.status(200).json({
        user
    })
});

// Change Update Password

module.exports.updatePassword = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req?.user?._id).select("+password");
    
    // check the previous user password
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
    if(!isPasswordMatched){
        return next(new ErrorHandler('Old Password is InCorrect',400));
    }
    user.password = req.body.password;
    user.save();

    res.status(200).json({
        success:true
    })
});

// Update User Profile 

module.exports.updateProfile = catchAsyncErrors(async(req,res,next)=>{
    const newUserData = {
        name:req.body.name,
        email:req.body.email
    };

    const user = await User.findByIdAndUpdate(req.user._id,newUserData,{new:true});

    res.status(200).json({
        user
    })
});

// Get All Users and Specific Users

module.exports.allUsers = catchAsyncErrors(async(req,res,next)=>{
    const users = await User.find({});

    res.status(200).json({
        users
    })
});

// Get user Details

module.exports.getUserDetails = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler('User Not Found',404));
    }

    res.status(200).json({
        user
    })
});

// Update User details == Admin

module.exports.updateUser = catchAsyncErrors(async(req,res,next)=>{
    const newUserData = {
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    };
    const user = await User.findByIdAndUpdate(req.params.id,newUserData,{new:true});

    res.status(200).json({
        user
    })
});

// Delete user == Admin

module.exports.deleteUser = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User not found with id ${req.params.id}`,404));
    }
    
    // Todo Remove user Avatar from Cloudnary

    await user.deleteOne();

    res.status(200).json({
        success:true
    })
});

// Upload User Avatar 

module.exports.uploadAvatar = catchAsyncErrors(async(req,res,next)=>{
    const avatarResponse = await upload_file(req.body.avatar,"ShopIT/avatars");

    // Remove Previous Avatar

    if(req?.user?.avatar?.url){
        await delete_file(req?.user?.avatar?.public_id);
    }

    const user = await User.findByIdAndUpdate(req?.user?._id,{
        avatar:avatarResponse
    });

    res.status(200).json({
        user
    })
});


