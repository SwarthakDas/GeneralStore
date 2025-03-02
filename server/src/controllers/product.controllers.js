import { Product } from "../models/product.model.js";
import { Seller } from "../models/seller.model.js";
import { User } from "../models/user.model.js";
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

export const buyProduct=AsyncHandler(async(req,res)=>{
    const {id,quantity}=req.body

    const incomingAccessToken = req.cookies.accessToken
  
    if (!incomingAccessToken) {
      return res.status(500).json(
        new ApiResponse(500, {}, "Error getting User")
      );
    }
  
    const decodedToken = jwt.verify(
        incomingAccessToken,
        process.env.USER_ACCESS_TOKEN_SECRET
    );

    const user=await User.findById(decodedToken?._id)
    if (!user) {
        return res.status(404).json(new ApiResponse(404, {}, "User not found"));
    }

    const product=await Product.findById(id)
    if(!product)return res.status(500).json(new ApiResponse(404, {}, "Error fetching product"));
    if(product.quantity<quantity)return res.status(200).json(new ApiResponse(200, {}, "Product out of stock"));
    product.quantity-=quantity;
    await product.save()

    const seller=await Seller.findById(product.seller)
    if (!seller)return res.status(500).json(new ApiResponse(404, {}, "Seller not found"));
    const inventoryItem = seller.inventory.find(item => item.product.toString() === id);
    if(!inventoryItem)return res.status(200).json(new ApiResponse(200, {}, "Product out of stock"));
    if (inventoryItem.quantity < quantity)return res.status(400).json(new ApiResponse(400, {}, "Not enough stock available in seller's inventory"));
    inventoryItem.quantity-=quantity;
    await seller.save()

    user.orders.push({product:product._id,quantity})
    await user.save()

    return res.status(201).json(new ApiResponse(201, "Product ordered successfully"));
})

export const getProducts=AsyncHandler(async(req,res)=>{
    const products = await Product.aggregate([
        {
            $group: {
                _id: "$category",
                products: { $push: "$$ROOT" }
            }
        }
    ]);
    if(!products)return res.status(400).json(new ApiResponse(400,"No products found"))
    return res.status(201).json(new ApiResponse(201,products, "Product fetched successfully"));
})