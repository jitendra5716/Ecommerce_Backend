const express = require('express');
const dotenv = require('dotenv');
dotenv.config({path:'config/config.env'});
const port = process.env.PORT;
const mongodbDB = require('./config/connectDB');
const errorMiddleware = require('./middleware/errors');
const cookieParser = require('cookie-parser');
const app = express();


process.on('uncaughtException',(err)=>{
    console.log(`Error ${err}`);
    console.log("Shutting down due to uncaught Exception");
    process.exit(1);
})

app.use(express.json({limit:"10mb"}));
app.use(cookieParser());
mongodbDB();

app.get('/',(req,res)=>{
    res.send("Home Page")
})


app.use('/',require('./routes/index'));
app.use(errorMiddleware);


const server = app.listen(port,(err)=>{
    if(err){
        return console.log("Error in running server ",err);
    }
    return console.log("Express Server is running on port ", port)
});

process.on('unhandledRejection',(err)=>{
    console.log(`Error ${err}`);
    console.log("Shutting down server due to unhandled Promise Rejection");
    server.close(()=>{
        process.exit(1);
    })
});