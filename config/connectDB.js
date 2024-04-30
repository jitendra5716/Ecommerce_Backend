const mongoose = require('mongoose');


const mongoDBConnect = ()=>{
    mongoose.connect(process.env.DB_URL).then((con)=>{
        console.log(`MongoDB Database Connected with Host = ${con?.connection?.host}`)
    })
}

module.exports = mongoDBConnect;