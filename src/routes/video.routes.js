import { Router } from "express";
import {publishAVideo, getVideoById, updateVideo , deleteVideo , getAllVideos , togglePublishStatus} from "../controllers/video.controller.js";
import {jwtVerify} from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js"


const router = Router();

router.use(jwtVerify)

router
     .route("/publish")
     .post(upload.fields([
        {
            name : "videoFile",
            maxCount: 1
        },{
            name : "thumbnail",
            maxCount: 1
        }
     ]), publishAVideo)

router.route("/:id").get(getVideoById)

router
        .route("/:id")
        .patch(upload.single("thumbnail"),updateVideo)
        .delete(deleteVideo)
        .get(getAllVideos)
        
router.route("/toggle-publish/:id")
        .patch(togglePublishStatus)





export default router;
