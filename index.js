require('dotenv').config()
const express=require('express')
const cookieParser=require('cookie-parser')
const cors=require('cors')
const mongoose=require('mongoose')
const userRouter = require('./routes/userRouter')
const propertyRouter = require('./routes/propertyRouter')
const app=express()
app.use(cookieParser())
app.use(express.json())
const frondend_url=process.env.FRONTEND_URL
app.use(cors({origin:frondend_url,credentials:true}))
main()
.then(()=>console.log("DB Connected ..."))
.catch(err=>console.log(err))

async function main() {
    await mongoose.connect(process.env.MONGODB_URL)
}

//User router
app.use('/api/users',userRouter)

//Property router
app.use('/api/property',propertyRouter)

app.get('/',(req,res)=>{
    res.send('Hello world')
})

const port=process.env.PORT || 3000
app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`)
})