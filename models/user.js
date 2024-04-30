const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        require:[true,"Please Enter Your Name"],
        maxLength:[50,"Your Name can not exceed 50 characters"]
    },
    email:{
        type:String,
        required:[true,"Please Enter Your Email"],
        unique:true
    },
    password:{
        type:String,
        required:[true,"Please Enter Your Password"],
        minLength:[6,"Your Password must be longer than 6 characters"],
        select: false
    },
    avatar:{
        public_id:String,
        url:String
    },
    role:{
        type:String,
        default:'user'
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
},{
    timestamps:true
});

//Encrypt Password before saving the user
userSchema.pre('save',async function(next){
    if(!this.isModified("password")){
        next()
    }
    this.password = await bcrypt.hash(this.password,10);
});

// Return Jwt Token

userSchema.methods.getJwtToken = function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRE_TIME});
}

// Compare User Password

userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
}

// Generate Password Reset Token

userSchema.methods.getResetPasswordToken = function(){
    // Generate Token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash and set to resetPasswordToken field

    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // set token expire time

    this.resetPasswordExpire = Date.now()+30*60*1000;

    return resetToken;
}


const User = mongoose.model('User',userSchema);
module.exports = User;