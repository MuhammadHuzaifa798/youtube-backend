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


app.use(cookieParser())




// routes 
import userRouter from "./routes/user.routes.js";


app.use("/api/user", userRouter)




export {app}