 import mongoose from "mongoose";

 const ProductSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    category: {
        type: String,
        required: true,
        enum: ["mobile", "grocery", "electronics", "fashion", "home", "beauty"]
    },
    price:{
        type:Number,
        required:true
    },
    seller:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller",
        required: true
    }
 },{timestamps:true})

 export const Product=mongoose.model("Product",ProductSchema)