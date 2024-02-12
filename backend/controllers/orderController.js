const Order=require('../models/orderModel')

const Product=require('../models/productModel')
const ErrorHandler=require('../utils/errorhandler')
const catchAsyncErrors=require('../middleware/catchAsyncErrors')

// Create New Order

exports.createOrder=catchAsyncErrors(async(req,res,next)=>{

    const {shippingInfo,orderItems,paymentInfo,itemsPrice,taxPrice,shippingPrice,totalPrice}=req.body;

    const order=await Order.create({
        shippingInfo,orderItems,paymentInfo,itemsPrice,taxPrice,shippingPrice,totalPrice,
        paidAt:Date.now(),
        user:req.user._id
    })


    res.status(201).json({
        sucess:true,
        order
    })
})


// get single order

exports.getOrder=catchAsyncErrors(async(req,res,next)=>{

    const order=await Order.findById(req.params.id).populate(
        "user",
        "name email"
    )

    if(!order){
        return next(new ErrorHandler("Order not found",404));
    }

    res.status(200).json({
        sucess:"true",
        order
    })

})


// get logged in user orders

exports.myOrders=catchAsyncErrors(async(req,res,next)=>{

    const orders=await Order.find({user:req.user._id})

    

    res.status(200).json({
        sucess:"true",
        orders
    })

})


// get all orders -- Admin

exports.getAllOrders=catchAsyncErrors(async(req,res,next)=>{

    const orders=await Order.find()

    let totalAmount=0;

    orders.forEach((order)=>{
        totalAmount+=order.totalPrice
    })

    

    res.status(200).json({
        sucess:"true",
        totalAmount,
        orders
    })

})


// update orders -- Admin

exports.updateOrder=catchAsyncErrors(async(req,res,next)=>{

    const order=await Order.findById(req.params.id)

    if(!order){
        return next(new ErrorHandler("Order not found",404));
    }

    if(order.orderStatus ==="Delivered"){
        return next(new ErrorHandler("This product is already delivered",404));
    }

    order.orderItems.forEach(async(o)=>{
        await updateStock(o.product,o.quantity);
    })
    
    order.orderStatus=req.body.status;

    if(req.body.status==="Delivered"){
        order.deliveredAt=Date.now()
    }
    
    await order.save({validateBeforeSave:false})

    res.status(200).json({
        sucess:"true",
       
    })

    

})
async function updateStock(id,quantity){
        const product=await Product.findById(id)
        product.Stock=quantity

        await product.save({validateBeforeSave:false})
}


// Delete order -- Admin

exports.deleteOrder=catchAsyncErrors(async(req,res,next)=>{

    const order=await Order.findById(req.params.id)

    if(!order){
        return next(new ErrorHandler("Order not found",404));
    }

   order.remove()
    res.status(200).json({
        sucess:"true",
        
    })

})