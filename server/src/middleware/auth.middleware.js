import {AsyncHandler} from "../utils/AsyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import jwt from "jsonwebtoken"
import {User} from "../models/user.model.js"
import { Seller } from "../models/seller.model.js"

export const verifyJWT=AsyncHandler(async(req,res,next)=>{
    try {
        const token=req.cookies?.accessToken

        if(!token){
            throw new ApiError(401,"Unauthorized request: No token provided")
        }

        let decodedToken
        try {
            decodedToken=jwt.verify(token,process.env.USER_ACCESS_TOKEN_SECRET)
        } catch (error) {
            throw new ApiError(401,"Invalid or expired access token")
        }

        const user=await User.findById(decodedToken?._id).select("-password -refreshToken") || await Seller.findById(decodedToken?._id).select("-password -refreshToken")

        if(!user){
            throw new ApiError(401,"Invalid Access Token: User not found")
        }

        req.user=user

        next()
    } catch (error) {
        throw new ApiError(401,error?.message||"Unauthorized request")
    }
})