import {AsyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/apiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary , deleteFromCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import fs from "fs"

const registerUser = AsyncHandler( async (req, res) =>{
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
     
    const {email, password, fullName , username} = req.body
    console.log({ email, password, fullName, username });


    // console.log("the req body is something like this ", req.body)
    
    if ( [email, password, fullName , username].some((feilds)=> feilds?.trim() === "")){
        throw new ApiError(400,"all feilds are required")
    }

    const existedUser = await User.findOne({
        $or :[{username} , {email}]
    })

    //  console.log("existed user ",existedUser)
    if (existedUser){
        throw new ApiError(409,"username is already exist")
    }
    
    const avatarlocalpath = req.files?.avatar[0]?.path;
    console.log(avatarlocalpath)

    // const coverImagelocalpath = req.files?.coverImage[0]?.path;
    let coverImagelocalpath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImagelocalpath = req.files.coverImage[0].path
    }
    // console.log(coverImagelocalpath)

    if(!avatarlocalpath){
        throw new ApiError(400,"Avatar file is required ")
    }

    const avatar = await uploadOnCloudinary(avatarlocalpath);
    const coverImage = await uploadOnCloudinary(coverImagelocalpath);

    // console.log("Avatar URL:", avatar.url);
    // console.log("Cover URL:", coverImage?.url);

     if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }


    const user = await User.create({
       fullName,
       avatar : avatar.url||"",
       coverImage : coverImage?.url || "",
       email,
       password,
       username : username.toLowerCase()
    })
    
     console.log("done8")
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    
     console.log("done9")
    // console.log("createdUser",createdUser)

    if(!createdUser){
        throw new ApiError(500,"somethig went wrong will registring the user")
    }
     
    return res.status(201).json(
        new ApiResponse(200,createdUser,"user register successfully")
    )
})

const generateAccessAndRefreshToken = async (userId)=>{
    try{
     const user = await User.findById(userId);
     const accessToken = user.generateAccessToken();
     const refreshToken = user.generateRefreshToken();
    
     user.refreshToken = refreshToken
     await user.save({validateBeforeSave:false})

     return {accessToken,refreshToken}


    }
    catch{
        throw new ApiError(500, "something is wrong while generating refresh token and access token")
    }


}

const loginUser = AsyncHandler( async (req , res)=>{
     // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie
    const {email , username , password } = req.body
     
    if (!email && !username){
        throw new ApiError(400,"email or username is required")
    }
     

    const user = await User.findOne({
        $or : [{username}, {email}]
    })
     
    
    if (!user){
        throw new ApiError(404 , "user is not found")
    }

     


    const isPasswordValid =  await user.IsPaswordCorrect(password);
    
     

    if(!isPasswordValid){
        throw new ApiError(401 , "password is not valid")
    }

     


    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)
    // console.log("Access Token:", AccessToken);
    // console.log("Refresh Token:", RefreshToken);

     

    const LoggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    const options = {
        httpOnly : true,
        secure : true,
    }
    
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user : LoggedInUser,accessToken,refreshToken
            },
            "user logged in successfully"

        )
    )

})

const logoutUser = AsyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken : 1
            }
            
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{}, "user logged out"))

})

const RefreshAccessToken = AsyncHandler(async (req, res) => {
    const incomingRefrstToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefrstToken){
        throw new ApiError(401,"unauthorized request")
    }

    const decodedtoken = jwt.verify(incomingRefrstToken,process.env.REFRESH_TOKEN_SECRET)
    console.log(decodedtoken)


    const user = await User.findById(decodedtoken?._id)
    console.log(user)
    if (!user){
        throw new ApiError(401, "invalid refresh token")
    }

    if(incomingRefrstToken!==user?.refreshToken){
        throw new ApiError(401,"Refresh token is expired or used")
    }

    const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id)
     console.log(refreshToken)

     const options = {
            httpOnly: true,
            secure: true
        }

    res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {accessToken,refreshToken}
            ,"Access Token Refresh"
        )
    )
}
)

const UpdatePassword = AsyncHandler(async (req , res) => {
    const {oldPassword , newPassword} = req.body;

    const user = await User.findById(req.user?._id)

    const passwordCorrect = await user.IsPaswordCorrect(oldPassword);

    if(!passwordCorrect){
        throw new ApiError(400,"invalid old password")
    }
    
    user.password = newPassword
    await user.save({validateBeforeSave:false}
    )


    return res
    .status(200)
    .json(new ApiResponse(200,
       {password}, "Password changed successfully"
    ))

})

const  getcurrentUser = AsyncHandler( async (req , res) =>{
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            req.user,
            "user fetched succesfully"
        )
    )
})

const updateAccountdetails = AsyncHandler(async (req,res)=>{
    const {fullName , email , username} = req.body

    if(!fullName && !email && !username){
        throw new ApiError(400,`${email} , ${fullName} , ${username} are required`)
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,   
        {
             $set:{
                fullName,
                email,
                username
             }
        },
        {
         new : true
        }
    ).select("-password -refreshToken")


    return res
    .status(200)
    .json(
        new ApiResponse(
        200,
        user,
        "update fields successfully")
    ) 
    
})


const updateAvatar = AsyncHandler(async (req,res)=>{
    const avatarlocalpath = req.file?.path


    console.log(avatarlocalpath)
    if (!avatarlocalpath){
        throw new ApiError(400,"avatar is required")
    }

   console.log(req.user.avatar)
    const deletedavatar = await deleteFromCloudinary(req.user.avatar)
    if (!deletedavatar) {
        console.error("Failed to delete old avatar from Cloudinary");
    }

    // try {
    //     await fs.unlinkAsync(avatarlocalpAth); // Clean up the local file
    // } catch (err) {
    //     console.error("Failed to delete local file:", err.message);
    // }

    const avatar = await uploadOnCloudinary(avatarlocalpath)
    if (!avatar) {
        throw new ApiError(400, "Avatar upload failed")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,       
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    )
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "Avatar updated successfully"
        )
    )
})


const updateCoverImage = AsyncHandler(async(req , res)=>{
    const coverImagelocalpath = req.file?.path
    console.log(coverImagelocalpath)

    if (!coverImagelocalpath){
        throw new ApiError(400,"avatar is required")
    }
    console.log(req.user.avatar)
    // Extract publicId from Cloudinary URL
    let pubicId = "";
    if (req.user.coverImage) {
        const fileName = req.user.coverImage.split("/").pop(); // e.g., "ehdjcnc3zk0swmz0p9xa.png"
        pubicId = fileName ? fileName.split(".")[0] : "";
    }
    const deletedImage = await deleteFromCloudinary(pubicId)
    if (!deletedImage) {
        console.error("Failed to delete old avatar from Cloudinary");
    }
    const coverImage = await uploadOnCloudinary(coverImagelocalpath)
    if (!coverImage) {
        throw new ApiError(400, "Avatar upload failed")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,       
        {
            $set: {
                coverImage : coverImage.url
            }
        },
        {
            new: true
        }
    )
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "CoverImage updated successfully"
        )
    )
})

const getUserchannelProfile = AsyncHandler(async(req,res)=>{
     const {username} = req.params

     if(!username?.trim()){
        throw new ApiError(400 , "username is missing")
     }


    const channel = await User.aggregate([
          {
    $match: {
      username: username?.toLowerCase()
    }
  },
  {
    $lookup: {
      from: "subscriptions",
      localField: "_id",
      foreignField: "channel",
      as: "subscribers"
    }
  },
  {
    $lookup: {
      from: "subscriptions",
      localField: "_id",
      foreignField: "subscriber",
      as: "subscribedTo"
    }
  },
  {
    $addFields: {
      subscriberCount: { $size: "$subscribers" },
      channelSubscribedToCount: { $size: "$subscribedTo" },
      isSubscribed: {
        $cond: {
          if: { $in: [req.user?._id, "$subscribers.subscriber"] },
          then: true,
          else: false
        }
      }
    }
  },
  {
    $project: {
      fullName: 1,
      email: 1,
      subscriberCount: 1,
      channelSubscribedToCount: 1,
      isSubscribed: 1,
      avatar: 1,
      coverImage: 1
    }
  }
        
        
])
    
    console.log(channel)
    if(!channel?.length){
    throw new ApiError(400,"channel does not exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            channel[0],
            "user fetched successfully"
        )
    )


})

const getUserWatchHistory = AsyncHandler(async(req,res)=>{

    const user = await User.aggregate([
        {
            $match : {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup : {
                from : "videos",
                localField : "watchHistory",
                foreignField :"_id",
                as : "watchHistory",
                pipeline:[
                    {
                        $lookup : {
                            from : "users",
                            localField : "owner",
                            foreignField : "_id",
                            as : "owner",
                            pipeline:[
                                {$project :{
                                    fullName:1,
                                    avatar:1,
                                    coverImage : 1
}
                                }
                            ]
                        }
                        
                        
                                  
                    }
                ]
            }
        },
        {$addFields : {
            owner : {
                $first :"$owner"

            }
        }}
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "get watch history successfully"
        ) 
    )
})









export {registerUser,
        loginUser, 
        logoutUser,
        RefreshAccessToken,
        UpdatePassword,
        getcurrentUser,
        updateAccountdetails,
        updateAvatar,
        updateCoverImage,
        getUserchannelProfile,
        getUserWatchHistory

    }