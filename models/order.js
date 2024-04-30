const mongoose = require('mongoose');


const orderSchema = new mongoose.Schema({
    shippingInfo: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        phoneNo: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [
        {
            name: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            image: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            }
        }
    ],
    paymentMethod: {
        type: String,
        required: [true, "Please Select Payment Method"],
        enum: {
            values: ['COD', 'Card'],
            message: 'Please Select COD or Card'
        }
    },
    paymentInfo: {
        id: String,
        status: String,
    },
    itemsPrice: {
        type: Number,
        required: true
    },
    taxAmount: {
        type: Number,
        required: true
    },
    shippingAmount: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    orderStatus: {
        type: String,
        default: 'Processing',
        enum: {
            values: ["Processing", "Shipped", "Delivered"],
            message: "Please Select Correct order Status"
        }
    },
    deliveredAt: Date
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;