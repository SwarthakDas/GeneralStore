import { Product } from "../models/product.model";
import { ApiError } from "../utils/ApiError";
import { AsyncHandler } from "../utils/AsyncHandler";

export const registerProduct=AsyncHandler(async(req,res)=>{
    const {name,description,category,price}=req.body
    const existingProduct = await Seller.findOne({
        $and: [{ name }, { category }]
    });
    if(existingProduct){
        console.log(exists)
    }

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

    const product=await Product.create({

    })
})