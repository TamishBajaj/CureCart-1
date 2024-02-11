const ErrorHandler=require('../utils/errorhandler')
const catchAsyncErrors=require('../middleware/catchAsyncErrors')

const User=require('../models/userModel')
const sendToken=require('../utils/jwtToken')
const sendEmail=require('../utils/sendEmail')
const crypto=require('crypto')


exports.registerUser=catchAsyncErrors(async(req,res,next) =>{

    const {name,email,password}= req.body

    const user=await User.create({
        name,
        email,
        password,
        avatar:{
            public_Id:'This is a testing ID',
            url: 'ImageUrl'
        },
    })

    sendToken(user,201,res)
})



exports.loginUser=catchAsyncErrors(async(req,res,next) =>{
    const {email,password}= req.body

    if(!email || !password){
        return next(new ErrorHandler("Please enter email and password",400))
    }

    const user=await User.findOne({ email }).select("+password")
    //agar email match nahi hua
    if(!user){
        return next(new ErrorHandler("Invalid email or password",401))
    }
    //agar email match hogya
    const isPasswordMatched=await user.comparePassword(password);
    //agar password match ni hua
    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password",401))
    }

    //aur agar pssword bi match hogya
   sendToken(user,200,res)


})

//logout user

exports.logout=catchAsyncErrors(async(req,res,next)=>{

    
    
       res.cookie('token',null,{
        expires: new Date(Date.now()),
        httpOnly:true,
        });
    res.status(200).json({
        sucess:true,
        message:"Logged Out"
    })
})

// Forgot Password

exports.forgotPassword=catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findOne({email:req.body.email});

    if(!user){
        return next(new ErrorHandler(`No account with this email found`,404));
    }
    const resetToken=user.getResetPasswordToken()

    await user.save({validateBeforeSave:false})

    const resetPasswordUrl=`${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`

    const message=`Your password reset token is :- \n\n ${resetPasswordUrl}. If you have not requested for it please ignore it`

    try {
        
        await sendEmail({
            email:user.email,
            subject:`Medicure password recovery`,
            message,


        })

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} sucessfully`,
        })

    } catch (error) {
        user.resetPasswordToken=undefined
        user.resetPasswordExpire=undefined

        await user.save({validateBeforeSave:false})
        return next(new ErrorHandler(error.message,500))
    }
})

exports.resetPassword=catchAsyncErrors(async(req,res,next)=>{
    //Get token and hashedtoken from url
    
     const resetPasswordToken=crypto.createHash("sha256").update(req.params.token).digest('hex')

     // we find user according to the given token
     const user=await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{ $gt : Date.now()}
     })

     // if the user is not find

     if(!user){
        return next(new ErrorHandler(`Reset password link is expired or invalid`,400))
     }

     // if the password and confirm password dont match
     if(req.body.password!=req.body.confirmPassword){
        return next(new ErrorHandler(`Passwords do not match`,400))
     }

     // if eveeything goes well change password

     user.password=req.body.password

     //finally we make these undefined as password has been changed
     user.resetPasswordToken=undefined
        user.resetPasswordExpire=undefined

        await user.save()
        sendToken(user,200,res)
})

// get user details

exports.getUserDetails=catchAsyncErrors(async(req,res,next)=>{

    const user=await User.findById(req.user.id)

    res.status(200).json({
        sucess:true,
        user
    })
})

// Update user password

exports.updatePassword=catchAsyncErrors(async(req,res,next)=>{

    const user=await User.findById(req.user.id).select("+password")

    const isPasswordMatched=await user.comparePassword(req.body.oldPassword)

    if(!isPasswordMatched){
        return next(new ErrorHandler('Incorrect old Password', 400))
    }

    if(req.body.newPassword!== req.body.confirmPassword){
        return next(new ErrorHandler('new password and confirm password dont match',400))
    }

    user.password=req.body.newPassword

    await user.save()

    // res.status(200).json({
    //     sucess:true,
    //     user
    // })

    sendToken(user,200,res)
})

//Update user profile

exports.updateProfile=catchAsyncErrors(async(req,res,next)=>{

    const newUserData={
        name:req.body.name,
        email:req.body.email
    }

    const user=await User.findByIdAndUpdate(req.user.id,newUserData,{
        new: true,
        runValidators: true,
        useFindAndModify:false

    })

    res.status(200).json({
       sucess:true
    })

    
})

// get all users9admin) -- > all user details

exports.getAllUsers=catchAsyncErrors(async(req,res,next)=>{

    const users=await User.find()

    res.status(200).json({
        sucess:true,
        users
    })
})

// get details of user(admin)

exports.getUser=catchAsyncErrors(async(req,res,next)=>{

    const user=await User.findById(req.params.id)

    if(!user){
        return next(new ErrorHandler(`no user find with the id ${req.params.id}`));
    }

    res.status(200).json({
        sucess:true,
        user
    })
})


// update user role --(admin)

exports.updateUserRole=catchAsyncErrors(async(req,res,next)=>{

    const newUserData={
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    }

    const user=await User.findByIdAndUpdate(req.params.id,newUserData,{
        new: true,
        runValidators: true,
        useFindAndModify:false

    })
    if(!user){
        return next(new ErrorHandler('No user found with that id',404))
    }

    res.status(200).json({
       sucess:true
    })

    
})


// delete user --(admin)

exports.deleteUser=catchAsyncErrors(async(req,res,next)=>{

    const user=await User.findById(req.params.id)

    if(!user){
        return next(new ErrorHandler('No user found with that id',404))
    }

    await user.remove()

    res.status(200).json({
       sucess:true,
       message:"User deleted Succesfully"
    })

    
})




