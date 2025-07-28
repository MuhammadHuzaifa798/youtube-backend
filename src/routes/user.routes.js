import { Router } from "express";
import { loginUser, 
         logoutUser, 
         RefreshAccessToken,
         registerUser ,
         UpdatePassword,
         getcurrentUser,
        updateAccountdetails,
        updateAvatar,
        updateCoverImage,
        getUserchannelProfile,
        getUserWatchHistory
} from "../controllers/user.controller.js";
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
router.route("/change-password").post(jwtVerify,UpdatePassword)
router.route("/currect-user").get(jwtVerify,getcurrentUser)
router.route("/update-account").patch(jwtVerify,updateAccountdetails)
router.route("/update-avatar").patch(jwtVerify,upload.single('avatar'),updateAvatar)
router.route("/update-coverimage").patch(jwtVerify,upload.single('coverImage'),updateCoverImage)
router.route("/c/:username").get(jwtVerify,getUserchannelProfile)
router.route("/watchHistory").get(jwtVerify,getUserWatchHistory)



export default router
