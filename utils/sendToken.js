// Create Token and Save it in Cookie
const sendToken = (user,statusCode,res)=>{
    //Create Jwt Token
    const token = user.getJwtToken();

    //options for cookie

    const options = {
        expiresIn: new Date(Date.now()+process.env.COOKIE_EXPRESS_TIME*24*60*60*1000),
        httpOnly:true
    };
    res.status(statusCode).cookie("token",token,options).json({
        token
    })
};

module.exports = sendToken;
