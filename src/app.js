import express from "express"
import cors from "cors"
import cookieParser  from "cookie-parser";


const app = express();

const crossOrigin = process.env.crossOrigin


app.use(cors({
    origin : crossOrigin,
    credentials : true
}))

app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended : true , limit : "16kb"}))
app.use(express.static("public"))


app.use(cookieParser());




// routes 
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import playlistRouter from "./routes/playlist.route.js"
import likeRouter from "./routes/like.routes.js"
import CommentRouter from "./routes/comment.routes.js"


app.use("/api/user", userRouter)
app.use("/api/videos",videoRouter)
app.use("/api/tweets",tweetRouter)
app.use("/api/subscriptions",subscriptionRouter)
app.use("/api/playlist",playlistRouter)
app.use("/api/likes",likeRouter)
app.use("/api/comments",CommentRouter)

export {app}