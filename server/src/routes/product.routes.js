import {Router} from "express"
import {verifyJWT} from "../middleware/auth.middleware.js"
import { registerProduct } from "../controllers/product.controllers.js"

export const router=Router()

router.route("/register").post(verifyJWT,registerProduct)