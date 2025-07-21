import {AsyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/apiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"
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
       avatar : avatar.url,
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
     const AccessToken = user.generateAccessToken();
     const RefreshToken = user.generateRefreshToken();
    
     user.refreshToken = RefreshToken
     await user.save({validateBeforeSave:false})

     return {AccessToken,RefreshToken}


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

     


    const {AccessToken,RefreshToken} = await generateAccessAndRefreshToken(user._id)
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
    .cookie("accessToken",AccessToken,options)
    .cookie("refreshToken",RefreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user : LoggedInUser,AccessToken,RefreshToken
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
                refreshToken : undefined
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


    const user = await User.findById(decodedtoken?._id)

    if (!user){
        throw new ApiError(401, "invalid refresh token")
    }

    if(incomingRefrstToken!==user?.refreshToken){
        throw new ApiError(401,"Refresh token is expired or used")
    }

    const {accessToken , newrefreshToken} = await generateAccessAndRefreshToken(user._id)


     const options = {
            httpOnly: true,
            secure: true
        }

    res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshTokrn",newrefreshToken,options)
    .json(
        new ApiResponse(
            200,
            {accessToken,refreshToken:newrefreshToken}
            ,"Access Token Refresh"
        )
    )
}
)



export {registerUser,
        loginUser, 
        logoutUser,
        RefreshAccessToken
    }