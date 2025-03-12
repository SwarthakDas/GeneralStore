import {AsyncHandler} from "../utils/AsyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {Seller} from "../models/seller.model.js"
import jwt from "jsonwebtoken"
import "dotenv/config"
import { Product } from "../models/product.model.js"

const generateTokenSeller=async(id)=>{
    try {
         const seller=await Seller.findById(id)
         if (!seller) throw new ApiError(404, "Seller not found");
         
         const accessToken=seller.generateAccessToken()
         const refreshToken=seller.generateRefreshToken()

         seller.refreshToken=refreshToken
         await seller.save({validateBeforeSave:false})

         return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Error generating token")
    }
}

export const registerSeller=AsyncHandler(async(req,res)=>{
    const {name,email,password,address}=req.body
    const existingSeller=await Seller.findOne({email})
    if(existingSeller)throw new ApiError(400,"Seller with this email already exists");

    const seller=await Seller.create({
        name,email,password,address
    })

    const createdSeller=await Seller.findById(seller._id).select("-password -refreshToken")
    if(!createdSeller)throw new ApiError(500,"Error occured while registering seller");
    
    const {accessToken, refreshToken}= await generateTokenSeller(seller._id)
    
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
            "seller created succesfully"
        )
    )
})

export const loginSeller=AsyncHandler(async(req,res)=>{
    const {email, password}= req.body
  
    if(!email){
      throw new ApiError(400,"email required")
    }
    
    const seller=await Seller.findOne({email})
    if(!seller){
      throw new ApiError(404, "Seller does not exist")
    }
    
    const isPasswordValid=await seller.isPasswordCorrect(password)
    if(!isPasswordValid){
      throw new ApiError(401, "Invalid seller credentials")
    }
  
    const {accessToken, refreshToken}= await generateTokenSeller(seller._id)
  
    const loggedInSeller=await Seller.findById(seller._id).select("-password -refreshToken")

    if(!loggedInSeller)throw new ApiError(500,"Failed to log int");
  
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
            "seller logged in succesfully"
        )
    )
})

export const logoutSeller=AsyncHandler(async(req, res)=>{
  const incomingRefreshToken = req.cookies.refreshToken
  
    if (!incomingRefreshToken) {
      return res.status(200).json(
        new ApiResponse(200, {}, "Seller logged out successfully")
      );
    }
  
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.USER_REFRESH_TOKEN_SECRET
    );

    await Seller.findByIdAndUpdate(
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
    .json(new ApiResponse(200,"Seller logged out successfully"))
  })

  export const refreshAccessTokenSeller = AsyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken
    
    if(!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request");
    }
    
    try {
      const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.USER_REFRESH_TOKEN_SECRET
      );
    
      const seller = await Seller.findById(decodedToken?._id);
      if(!seller) {
        throw new ApiError(401, "Invalid refresh token");
      }
      
      const options = {
        httpOnly: true,
        secure: true
      };
      
      const {accessToken, newRefreshToken} = await generateTokenSeller(seller._id);
    
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

export const sellerInventory=AsyncHandler(async(req,res)=>{
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

  const seller= await Seller.findById(decodedToken._id)
  if(!seller)return res.status(404).json(new ApiResponse(404, {}, "Seller not found"));

  const orders = await Promise.all(
    seller.inventory.map(async (item) => {
      const product = await Product.findById(item.product).select("-_id -createdAt -updatedAt -quantity -__v");
      return {
        product,
        quantity: item.quantity,
      };
    })
  );

  return res.status(201).json(new ApiResponse(201,orders, "Inventory fetched successfully"));
})