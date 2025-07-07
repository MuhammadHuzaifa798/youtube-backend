import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path : "./.env"
})


connectDB()
.then(()=>{
   const server = app.listen(process.env.PORT || 8000,()=>{
    console.log(`server is listening at ${process.env.PORT}`)
  });

   server.on('error' , (error)=>{
    console.log("server listen error" , error);
    throw error
   }

)
   
   
})
.catch((error)=>{
  console.log("mongo db connection falied !!!",error)
})