const products = require('./data');
const mongoose = require('mongoose');
const Product = require('../models/product');

const seedProducts = async(req,res)=>{
    try{
        await mongoose.connect("mongodb://localhost:27017/shopit_v1");
        await Product.deleteMany();
        console.log("Product Deleted!");
        await Product.insertMany(products);
        console.log("Products are Added!");
        process.exit();
    }catch(err){
        return console.log("Error in Seed the products",err.message);
    }
}

seedProducts();