const Order = require('../models/order');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const Product = require('../models/product');


// Create New Order

module.exports.newOrder = catchAsyncErrors(async(req,res,next)=>{
    const {orderItems,shippingInfo,itemsPrice,taxAmount,shippingAmount,totalAmount,paymentMethod,paymentInfo} = req.body;

    const order = await Order.create({
        orderItems,shippingInfo,itemsPrice,taxAmount,shippingAmount,totalAmount,paymentMethod,paymentInfo,
        user:req.user._id
    });

    res.status(200).json({
        order
    })
});

// Get Order Details

module.exports.getOrderDetails = catchAsyncErrors(async(req,res,next)=>{
    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler(`No order found with this id ${req.params.id}`,404))
    }

    res.status(200).json({
        order
    })
});

// Get Current User Order 

module.exports.myOrders = catchAsyncErrors(async(req,res,next)=>{
    const orders = await Order.find({user:req.user._id}).populate("user","name email");

    res.status(200).json({
        orders
    })
});

// Get All Orders == Admin

module.exports.allOrders = catchAsyncErrors(async(req,res,next)=>{
    const orders = await Order.find({});

    res.status(200).json({
        orders
    })
});

// Update/Process order === Admin

module.exports.updateOrder = catchAsyncErrors(async(req,res,next)=>{
    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler('No Order found with this id',404))
    };

    if(order?.orderStatus==='Delivered'){
        return next(new ErrorHandler('You have already delivered this order',400));
    }

    // Update Product Stock

    order?.orderItems?.forEach(async(item)=>{
        const product = await Product.findById(item?.product?.toString());

        if(!product){
            return next(new ErrorHandler('No Product found with this id',400));
        }

        product.stock = product.stock - item.quantity;

        await product.save({validateBeforeSave:false});

        order.orderStatus = req.body.status;
        order.deliveredAt = Date.now();
        await order.save();

        res.status(200).json({
            success:true
        })
        
    })
});

// Delete Order === Admin

module.exports.deleteOrder = catchAsyncErrors(async(req,res,next)=>{
    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler('No Order Found with this Id',400));
    }
    await order.deleteOne();

    res.status(200).json({
        success:true
    })
});

