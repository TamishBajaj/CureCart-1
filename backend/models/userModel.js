const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const crypto=require('crypto')

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please provide a name of user'],
        maxLength:[30,'Name cannot excedd 30 characters'],
        minLength:[4,'Please enter a name having freater than 4 characters']
    },
    email:{
        type:String,
        required:[true,'Please provide email for a user'],
        unique:true,
        validate:[validator.isEmail,'Please provide a valid email Id']
    },
    password:{
        type:String,
        require:[true,'Please provide your password'],
        minlength:[8,'Password should be greater than 8 words'],
        select:false
    },
    avatar:{
        public_Id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
            }
    },
    role:{
        type:String,
        default:'user'
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
})


// pre method is used like :- isse pehle schema save ho usse pehle ye kaam kardo

// isModified wala issliye check krahe hai kuki agr password chnage hua usse wapis bcrypt karna hoag
userSchema.pre("save",async function(next){
if(!this.isModified("password")){
    next();
}

    this.password= await bcrypt.hash(this.password,10)
})

//JWT 

userSchema.methods.getJWTToken=function(){
    return jwt.sign({id : this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE,
    })
}

//comparePassword function

userSchema.methods.comparePassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password)
}

//generating password reset token

userSchema.methods.getResetPasswordToken=function(){

    // generating token
    const resetToken=crypto.randomBytes(20).toString('hex')

    //Hashing and adding resetPasswordToken to userSchema

    this.resetPasswordToken=crypto.createHash("sha256").update(resetToken).digest('hex')

    this.resetPasswordExpire=Date.now() + 15*60*1000
    return resetToken;

}



module.exports=mongoose.model("user",userSchema)