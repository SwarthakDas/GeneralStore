import {Router} from "express"
import {verifyJWT} from "../middleware/auth.middleware.js"
import { buyProduct, getProducts, registerProduct } from "../controllers/product.controllers.js"

export const router=Router()

router.route("/register").post(verifyJWT,registerProduct)
router.route("/buy").post(verifyJWT,buyProduct)
router.route("/get-products").get(verifyJWT,getProducts)