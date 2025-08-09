import { Router } from "express";
import { toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels} from "../controllers/subscription.controller.js"

import { jwtVerify } from "../middlewares/auth.middleware.js";


const router = Router();

router.use(jwtVerify)

router.route("/c/:channelId")
       .post(toggleSubscription)
       .get(getUserChannelSubscribers)

router.route("/s/:subscriberId")
       .get(getSubscribedChannels)

export default router