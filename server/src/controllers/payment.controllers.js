import dotenv from "dotenv"
import Razorpay from "razorpay"
import { AsyncHandler } from "../utils/AsyncHandler.js"
dotenv.config()

const razorpayInstance=new Razorpay({
    key_id: process.env.RAZORPAY_ID_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY
})

export const renderProductPage=AsyncHandler(async(req,res)=>{
    res.render('product')
})

export const createOrder=AsyncHandler(async(req,res)=>{
    const amount=req.body.amount*100
    const options={
        amount:amount,
        currency: 'INR',
        receipt: 'swarthakd@gmail.com'
    }

    razorpayInstance.orders.create(options,
        (err,order)=>{
            if(!err){
                res.status(200).send({
                    success:true,
                    msg:'Order Created',
                    order_id:order.id,
                    amount:amount,
                    key_id: process.env.RAZORPAY_ID_KEY,
                    product_name:req.body.name,
                    description:req.body.description,
                    contact:'9083901793',
                    name:"Swarthak Das",
                    email:"swarthakd@gmail.com"
                })
            }else{
                res.status(400).send({success:false,msg:'Something went wrong!'});
            }
        }
    )
})