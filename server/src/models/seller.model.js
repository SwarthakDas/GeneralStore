 import mongoose from "mongoose";
 import bcrypt from "bcrypt"
 import jwt from "jsonwebtoken"
 import "dotenv/config"

 const SellerSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    inventory: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 0
        }
    }]
    
 },{timestamps:true})

 SellerSchema.methods.toJSON = function () {
    const seller = this.toObject();
    delete seller.password;
    return seller;
 };

 SellerSchema.pre("save",async function(next){
    if(!this.isModified("password"))return next();
    const salt=await bcrypt.genSalt(10)
    this.password=await bcrypt.hash(this.password,salt)
    next()
 })

 SellerSchema.methods.isPasswordCorrect=async function(password){
    return this.password? await bcrypt.compare(password,this.password):false;
 }

 SellerSchema.methods.generateAccessToken=function(){
    return jwt.sign({
        _id:this._id,
        email:this.email,
        name:this.name
    },
    process.env.USER_ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.USER_ACCESS_TOKEN_EXPIRY
    }
    )
 }

 SellerSchema.methods.generateRefreshToken=function(){
    return jwt.sign({
        _id:this._id,
        email:this.email,
        name:this.name
    },
    process.env.USER_REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.USER_REFRESH_TOKEN_EXPIRY
    }
    )
 }

 export const Seller=mongoose.model("Seller",SellerSchema)