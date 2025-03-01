import bodyParser from "body-parser"
import dotenv from "dotenv"
import helmet from "helmet"
import morgan from "morgan"
import cors from "cors"
import express from "express"
import cookieParser from "cookie-parser"
import connectDB from "./db/index.js"
import { router as userRoutes } from "./routes/user.routes.js"
import { router as sellerRoutes } from "./routes/seller.routes.js"

dotenv.config()
const app=express()
app.use(express.json())
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({policy:"cross-origin"}))
app.use(morgan("common"))
app.use(bodyParser.json({limit:"30mb"}))
app.use(bodyParser.urlencoded({limit:"30mb",extended:true}))
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    methods:["GET","POST","PUT","DELETE"],
    allowedHeaders:["Content-Type","Authorization"],
    credentials:true
}))
app.use(express.static("public"))
app.use(cookieParser())

app.use("/user",userRoutes)
app.use("/seller",sellerRoutes)

const PORT=process.env.PORT || 6001
connectDB()
.then(()=>{
    app.listen(PORT,()=>console.log(`Server running on port ${PORT}`))
})
.catch((error)=>console.error(`${error} did not connect`))