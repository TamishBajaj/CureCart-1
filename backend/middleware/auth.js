
const catchAsyncErrors=require('./catchAsyncErrors')
const ErrorHandler = require('../utils/errorhandler')
const jwt=require('jsonwebtoken')
const User=require('../models/userModel')

const isAuthenticatedUser=catchAsyncErrors( async(req,res,next)=>{
    const {token}=req.cookies
    
    if(!token){
        return next(new ErrorHandler("Please Login to acess this resource",401))
    }

    const decodedData=jwt.verify(token,process.env.JWT_SECRET)
    req.user=await User.findById(decodedData.id)
    next()
    
})

const authorizedRoles= (...roles)=>{  // this means we will be checking the roles array
    return (req, res, next)=> {
        if(!roles.includes(req.user.role)){

            return next(
            new ErrorHandler(
                `Role:${req.user.role} is not allowed to acess this resource`,403
            )
            )
        }

        next()
    }
}

module.exports={isAuthenticatedUser,authorizedRoles}