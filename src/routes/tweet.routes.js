import { Router } from "express";
import {jwtVerify} from "../middlewares/auth.middleware.js";
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} from "../controllers/Tweet.controller.js";


const router = Router();


router.use(jwtVerify)


router.route("/").post(createTweet)

router.route("/user/:userId").get(getUserTweets)

router.route("/:tweetId").patch(updateTweet).delete(deleteTweet)


export default router


