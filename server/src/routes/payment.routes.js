import {Router} from "express"
import {verifyJWT} from "../middleware/auth.middleware.js"
import { createOrder, renderProductPage } from "../controllers/payment.controllers.js"

export const router=Router()

router.route("/pay").get(verifyJWT,renderProductPage)
router.route("/create-order").post(verifyJWT,createOrder)
