import { Router } from "express";
import { loginUser, logoutUser, RefreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { jwtVerify } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
           name : "avatar",
           maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]), registerUser)

router.route("/login").post(loginUser)

// secure route

router.route("/logout").post(jwtVerify , logoutUser)
router.route("/refresh-token").post(RefreshAccessToken)

export default router
