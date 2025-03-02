import {AsyncHandler} from "../utils/AsyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import jwt from "jsonwebtoken"
import "dotenv/config"
import {Product} from "../models/product.model.js"
import { Seller } from "../models/seller.model.js"

const generateTokenUser=async(id)=>{
    try {
         const user=await User.findById(id)
         if (!user) throw new ApiError(404, "User not found");
         
         const accessToken=user.generateAccessToken()
         const refreshToken=user.generateRefreshToken()

         user.refreshToken=refreshToken
         await user.save({validateBeforeSave:false})

         return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Error generating token")
    }
}

export const registerUser=AsyncHandler(async(req,res)=>{
    const {name,email,password,address}=req.body
    const existingUser=await User.findOne({email})
    if(existingUser)throw new ApiError(400,"User with this email already exists");

    const user=await User.create({
        name,email,password,address
    })

    const createdUser=await User.findById(user._id).select("-password")
    if(!createdUser)throw new ApiError(500,"Error occured while registering user");
    
    const {accessToken, refreshToken}= await generateTokenUser(user._id)
    
    const options = {
      httpOnly: true,
      sameSite: "Strict",
    };
  
    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            "user created succesfully"
        )
    )
})

export const loginUser=AsyncHandler(async(req,res)=>{
    const {email, password}= req.body
  
    if(!email){
      throw new ApiError(400,"email required")
    }
    
    const user=await User.findOne({email})
    if(!user){
      throw new ApiError(404, "User does not exist")
    }
    
    const isPasswordValid=await user.isPasswordCorrect(password)
    if(!isPasswordValid){
      throw new ApiError(401, "Invalid user credentials")
    }
  
    const {accessToken, refreshToken}= await generateTokenUser(user._id)
  
    const loggedInUser=await User.findById(user._id).select("-password")

    if(!loggedInUser)throw new ApiError(500,"Failed to log int");
  
    const options = {
      httpOnly: true,
      sameSite: "Strict",
    };
  
    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            "user logged in succesfully"
        )
    )
})

export const logoutUser=AsyncHandler(async(req, res)=>{
  const incomingRefreshToken = req.cookies.refreshToken

  if (!incomingRefreshToken) {
    return res.status(200).json(
      new ApiResponse(200, {}, "User logged out successfully")
    );
  }

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.USER_REFRESH_TOKEN_SECRET
  );
    await User.findByIdAndUpdate(
      decodedToken?._id,
        {
            $set:{
            refreshToken: undefined,
            accessToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options={
        httpOnly: true,
        secure: true
    }
    
    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200,"User logged out successfully"))
  })

  export const refreshAccessTokenUser = AsyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken
    
    if(!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request");
    }
    
    try {
      const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.USER_REFRESH_TOKEN_SECRET
      );
    
      const user = await User.findById(decodedToken?._id);
      if(!user) {
        throw new ApiError(401, "Invalid refresh token");
      }
      
      const options = {
        httpOnly: true,
        secure: true
      };
      
      const {accessToken, newRefreshToken} = await generateTokenUser(user._id);
    
      return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
          new ApiResponse(
            200, 
            "Access token refreshed"
          )
        );
    } catch (error) {
      throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

export const userOrders=AsyncHandler(async(req,res)=>{
  const incomingAccessToken = req.cookies.accessToken
    
      if (!incomingAccessToken) {
        return res.status(500).json(
          new ApiResponse(500, {}, "Error getting Seller")
        );
      }
    
      const decodedToken = jwt.verify(
          incomingAccessToken,
          process.env.USER_ACCESS_TOKEN_SECRET
      );

  const user= await User.findById(decodedToken._id)
  if(!user)return res.status(404).json(new ApiResponse(404, {}, "User not found"));

  const orders = await Promise.all(
    user.orders.map(async (item) => {
      const product = await Product.findById(item.product).select("-_id -createdAt -updatedAt -quantity -__v");
      const seller=await Seller.findById(product.seller).select("name address")
      return {
        product,
        quantity: item.quantity,
        sellerName:seller.name,
        sellerAddress:seller.address
      };
    })
  );

  return res.status(201).json(new ApiResponse(201,orders, "Orders fetched successfully"));
})