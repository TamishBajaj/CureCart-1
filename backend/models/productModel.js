const mongoose=require('mongoose')

const productSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Name is required compulsory"],
        trim:true
    },
    description:{
        type:String,
        required:[true,"description is required"]
    },
    price:{
        type:Number,
        require:[true,'Price is required'],
        maxLength:[8,"Price cannot be more than 8 digits"]
    },
    ratings:{
        type:Number,
        default:0
    },
    images:[
        {
        public_id:{
            type:String,
            required:true        // immages will be in array as bht sari hogi
        },
        url:{
            type:String,
            required:true
        }

    }
    ],

    category:{
        type:String,
        required:[true,"Enter the Product category please"]
    },
    stock:{
        type:Number,
        required:[true,"stock number is required"],
        maxLength:[4,"Stock cannot exceed 4 digits"],
        default:1
    },
    numOfReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {
            user:{
                type: mongoose.Schema.ObjectId,
                ref:'User',
                required:true,
            },
            name:{
                type: String ,
                required : [ true , "Name field can not be empty" ]
            },
            rating : {
                type : Number ,
                required : [ true , "Please provide a Rating."] ,
            },
            Comment : {
                type : String ,
                required : false ,
                }
        }
    ],

    user:{
        type: mongoose.Schema.ObjectId,
        ref:'User',
        required:true,
    },

    createdAt:{
        type:Date,
        default:Date.now()
    }




})

module.exports=mongoose.model("Product",productSchema)