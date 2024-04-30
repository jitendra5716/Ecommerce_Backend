const Product = require('../models/product');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const APIFilter = require('../utils/apiFilter');

// Display All Products
module.exports.getAllProducts =  catchAsyncErrors(async(req,res,next)=>{
    try{
        const resPerPage = 4;
        const apiFilter = new APIFilter(Product,req.query).search().filters()
        let products = await apiFilter.query;
        let filteredProductCount = products.length;

        apiFilter.pagination(resPerPage);
        products = await apiFilter.query.clone();

        return res.status(200).json({
            resPerPage,
            filteredProductCount,
            products
        })
    }catch(err){
        return console.log("Error in getting all Products",err);
    }
})

//Create Product --- Admin

module.exports.createProduct = catchAsyncErrors(async(req,res,next)=>{
    try{
        req.body.user = req.user._id
        const product = await Product.create(req.body);

         return res.status(201).json({
            product
        })
    }catch(err){
        return console.log("Error in Creating Product",err.message);
    }
})

// get Single Prduct 

module.exports.getProductDetails = catchAsyncErrors(async(req,res,next)=>{
    try{
        const product = await Product.findById(req?.params?.id);
        if(!product){
            return next(new ErrorHandler('Product Not Found',404))
        }
        return res.status(200).json({
            product
        })
    }catch(err){
        return console.log("Error in getting single product details",err.message);
    }
})

// Update Products 

module.exports.updateProduct =  catchAsyncErrors(async(req,res,next)=>{
    try{
        let product = await Product.findById(req?.params?.id);
        if(!product){
            return next(new ErrorHandler('Product Not Found',404))
        }
        product = await Product.findByIdAndUpdate(req?.params?.id,req.body,{new:true});
        return res.status(200).json({
            product
        });
    }catch(err){
        return console.log("Error in Update the Product");
    }
})

// Delete Product

module.exports.deleteProduct =  catchAsyncErrors(async(req,res,next)=>{
    try{
        let product = await Product.findById(req?.params?.id);
        if(!product){
            return next(new ErrorHandler('Product Not Found',404))
        }
        await product.deleteOne();
        return res.status(200).json({
            message:"Product deleted Successfully!"
        })
    }catch(err){
        return console.log("Error in Delete the Product");
    }
})

// Create Product Review

module.exports.createProductReview = catchAsyncErrors(async(req,res,next)=>{
    const {rating,comment,productId} = req.body;

    const review = {
        user:req?.user._id,
        rating:Number(rating),
        comment,
    };

    const product = await Product.findById(productId);

    if(!product){
        return next(new ErrorHandler('Product not found!',400));
    }
    const isReviewed = product?.reviews?.find((r)=>r.user.toString() === req?.user?._id.toString());
    
    if(isReviewed){
        product.reviews.forEach((review)=>{
            if(review?.user?.toString()===req?.user?._id.toString()){
                review.comment = comment;
                review.rating = rating;
            }
        })
    }else{
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    product.ratings = product.reviews.reduce((acc,item)=>item.rating+acc,0)/product.reviews.length;

    await product.save({validateBeforeSave:false});

    res.status(200).json({
        success:true
    })
});

// Get All Reveiw of Product

module.exports.getProductReviews = catchAsyncErrors(async(req,res,next)=>{
    const product = await Product.findById(req.query.id);

    if(!product){
        return next(new ErrorHandler('Product Not Found!',404));
    }

    res.status(200).json({
        reviews:product.reviews
    })
});


// Delete Product Reviews

module.exports.deleteReview = catchAsyncErrors(async(req,res,next)=>{
    let product = await Product.findById(req.query.productId);

    if(!product){
        return next(new ErrorHandler('Product Not Found!',404));
    }

    const reviews = product?.reviews?.filter((review)=>review._id.toString() !== req?.query?.id.toString());

    const numOfReviews = reviews.length;

    const ratings = numOfReviews === 0 ? 0 : product.reviews.reduce((acc,item)=>item.rating+acc,0)/numOfReviews;

    product = await Product.findByIdAndUpdate(req.query.productId,{reviews,numOfReviews,ratings},{new:true});

    await product.save({validateBeforeSave:false});

    res.status(200).json({
        success:true,
        product
    })
})