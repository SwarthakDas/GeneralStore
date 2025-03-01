import {Router} from "express"
import { loginUser, logoutUser, refreshAccessTokenUser, registerUser } from "../controllers/user.controllers.js"
import {verifyJWT} from "../middleware/auth.middleware.js"

export const router=Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").get(verifyJWT,logoutUser)
router.route("/new-token").get(refreshAccessTokenUser)