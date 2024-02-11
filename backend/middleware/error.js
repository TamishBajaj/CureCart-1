const ErrorHandler=import('../utils/errorhandler.js')

module.exports=(err,req,res,next)=>{
    err.statusCode=err.statusCode || 500
    err.message= err.message || "Internal Serevr error"


    // wrong mongo db id error

    if(err.name==="CastError"){
        const message=`Resource not found . Invalid ${err.path}`;
        err=new ErrorHandler(message,400)
    }

    //duplicate  key error from mongoose

    if(err.code===11000){
        const message=`Duplicate ${Object.keys()} entered`
        err = new ErrorHandler(message,400);


    }

    //json webtoken error

    if(err.name==="jsonWebTokenError"){
        const message=`json web token is invlaid please try again`;
        err=new ErrorHandler(message,400)
    }

    //JWT expire error

    if(err.name==="TokenExpiredError"){
        const message=`json web Token expired , please try again`;
        err=new ErrorHandler(message,400)
    }

    res.status(err.statusCode).json({
        sucess:false,
        message:err.message

    })
}