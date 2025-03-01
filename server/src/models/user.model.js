 import mongoose from "mongoose";
 import bcrypt from "bcrypt"
 import jwt from "jsonwebtoken"
 import "dotenv/config"

 const UserSchema=new mongoose.Schema({
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
    cart:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    }]
 },{timestamps:true})

 UserSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
 };

 UserSchema.pre("save",async function(next){
    if(!this.isModified("password"))return next();
    const salt=await bcrypt.genSalt(10)
    this.password=await bcrypt.hash(this.password,salt)
    next()
 })

 UserSchema.methods.isPasswordCorrect=async function(password){
    return this.password? await bcrypt.compare(password,this.password):false;
 }

 UserSchema.methods.generateAccessToken=function(){
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

 UserSchema.methods.generateRefreshToken=function(){
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

 export const User=mongoose.model("User",UserSchema)