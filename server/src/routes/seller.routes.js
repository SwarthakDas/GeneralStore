import {Router} from "express"
import {verifyJWT} from "../middleware/auth.middleware.js"
import { loginSeller, logoutSeller, refreshAccessTokenSeller, registerSeller, sellerInventory } from "../controllers/seller.controllers.js"

export const router=Router()

router.route("/register").post(registerSeller)
router.route("/login").post(loginSeller)
router.route("/logout").get(verifyJWT,logoutSeller)
router.route("/new-token").get(refreshAccessTokenSeller)
router.route("/inventory").get(verifyJWT,sellerInventory)