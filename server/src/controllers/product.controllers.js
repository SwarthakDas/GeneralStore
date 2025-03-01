import { Product } from "../models/product.model.js";
import { Seller } from "../models/seller.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import "dotenv/config"
import jwt from "jsonwebtoken"

export const registerProduct=AsyncHandler(async(req,res)=>{
    const {name,description,category,price,quantity}=req.body
    let existingProduct = await Product.findOne({ name, category });

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

    const seller=await Seller.findById(decodedToken?._id)
    if (!seller) {
        return res.status(404).json(new ApiResponse(404, {}, "Seller not found"));
    }

    if (existingProduct) {
        existingProduct.quantity += quantity;
        await existingProduct.save();

        const inventoryItem = seller.inventory.find(item => item.product.toString() === existingProduct._id.toString());

        if (inventoryItem) {
            inventoryItem.quantity += quantity;
        } else {
            seller.inventory.push({ product: existingProduct._id, quantity });
        }

        await seller.save();

        return res.status(200).json(new ApiResponse(200, "Product quantity updated successfully"));
    }

    const product=await Product.create({
        name,description,category,price,quantity,seller:seller._id
    })

    seller.inventory.push({ product: product._id, quantity });
    await seller.save();

    return res.status(201).json(new ApiResponse(201, "Product registered successfully"));
})