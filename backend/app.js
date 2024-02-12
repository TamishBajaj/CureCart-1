require('dotenv').config()

const express=require('express')
const app=express()
const cookieParser=require('cookie-parser')

const connectDB=require('./db/connect')

const product= require("./routes/productRoute")
const user=require('./routes/userRoute')
const order=require('./routes/orderRoute')

const errorMiddleware=require('./middleware/error')

// Handelling uncaugth exceptions

process.on("uncaughtException",(err)=>{
    console.log(`Error: ${err.message}`)
    console.log(`Shutting down te server due to uncaugth exception`)
    process.exit(1)

})

app.use(express.json())
app.use(cookieParser())


// error middleware
app.use(errorMiddleware)

//Route Imports


app.use("/api/v1/tasks",product)
app.use("/api/v1/tasks",user)
app.use("/api/v1/tasks",order)

const port=process.env.PORT || 3000


const start= async()=>{
    try {
        //connect DB
        
        await connectDB(process.env.MONGO_URI)
        
        app.listen(port,console.log(`Server is listening on port ${port}`))
    } catch (error) {
        console.log(error)
    }
}

start()



