import { ApiError } from "../utils/apiError.js";
import { AsyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";


export const jwtVerify = AsyncHandler(async (req , _ , next )=>{
    try{
      const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
       
      console.log("token : ",token)

      if(!token){
        throw new ApiError(401, "Unauthorazized request")
      }

      const decodeToken = await jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)

      const user = await User.findById(decodeToken._id).select("-password -refreshToken")

      if(!user){
        throw new ApiError(401,"invalid access")
      }

      req.user = user;

      next()

    }catch(error){
      throw new ApiError(401, error?.message || "invalid access token")
    }
})