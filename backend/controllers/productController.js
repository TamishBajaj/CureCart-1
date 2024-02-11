const Product=require('../models/productModel')
const ErrorHandler=require('../utils/errorhandler')
const catchAsyncErrors=require('../middleware/catchAsyncErrors')
const ApiFeatures=require('../utils/apifeatures')


// create product -- Admin
exports.createProduct= catchAsyncErrors(async (req,res,next) =>{

    req.body.user=req.user.id

    const product= await Product.create(req.body)

    res.status(201).json({
        sucess:true,
        product
    })
})


// Get all products

exports.getAllProducts=catchAsyncErrors(async(req,res)=>{

    const resultPerPage=5;
    const productCount=await Product.countDocuments()

    const apiFeature=new ApiFeatures(Product.find(),req.query).search().filter().pagination(resultPerPage)

    const products=await apiFeature.query
    res.status(200).json({
        sucess:true,
        products,
        productCount
    })
})


//update Product -- Admin

exports.updateProduct=catchAsyncErrors(async(req,res)=>{
    let product=await Product.findById(req.params.id)

    if(!product){
        return next(new ErrorHandler("Product not found",404))
    }
    // if we found the product

    product=await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        sucess:true,
        product
    })


}
)

// Get Product details

exports.getProductDetails=catchAsyncErrors(async(req,res,next)=>{
    let product=await Product.findById(req.params.id)

    if(!product){
        return next(new ErrorHandler("Product not found",404))
    }

    res.status(200).json({
        sucess:true,
        product
    })

})


// Delete a product

exports.deleteProduct=catchAsyncErrors(async(req,res,next)=>{

    let product=await Product.findById(req.params.id)

    if(!product){
        return next(new ErrorHandler("Product not found",404))
    }
    
    // if we found the product

   await product.remove();

    res.status(200).json({
        sucess:true,
        message:"Product is deleted"
    })

})

// create new review or update review

exports.createProductReveiw=catchAsyncErrors(async(req,res,next)=>{

    const {rating,Comment,productId}=req.body

    const review={
        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        Comment,
    }

    const product=await Product.findById(productId)

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }


    const isReviewed=product.reviews.find(
        (rev)=>rev.user.toString()===req.user._id.toString())


    if(isReviewed){

        product.reviews.forEach(rev =>{
            if(rev.user.toString() === req.user._id.toString())
            rev.rating=rating,
            rev.Comment=Comment
        })
    }else{
        product.reviews.push(review)
        product.numOfReviews=product.reviews.length
        
    }

    let avg=0;

    product.reviews.forEach((rev)=>{
        avg+=rev.rating

    })
    
    product.ratings = avg / product.reviews.length;
    await product.save({validateBeforeSave:false})

    res.status(200).json({
        success:true
    })

})


// get all product reviews

exports.getAllProductReveiews=catchAsyncErrors(async(req,res,next)=>{
    const product=await Product.findById(req.query.id);

    if(!product){
        return next(new ErrorHandler("Product not found",404))
    }

    res.status(200).json({
        success: true,
        reviews:product.reviews
    })

})


// delete product reveiws

exports.deleteReview=catchAsyncErrors(async(req,res,next)=>{
    const product=await Product.findById(req.query.productId);

    if(!product){
        return next(new ErrorHandler("Product not found",404))
    }

    const reviews=product.reviews.filter(rev=>rev._id.toString()!==req.query.id.toString())

   

    let avg = 0;
    let numOfReviews = reviews.length;

    if (numOfReviews > 0) {
        reviews.forEach((rev) => {
            if (!isNaN(rev.rating)) {
                avg += rev.rating;
            }
        });

        const ratings = avg / numOfReviews;
    } else {
        // If there are no reviews, set ratings to 0
        ratings = 0;
    }

    await Product.findByIdAndUpdate(req.query.productId,{
        reviews,
        ratings,
        numOfReviews

    },{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success: true,
       
    })

})