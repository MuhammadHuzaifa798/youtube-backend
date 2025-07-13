import {AsyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/apiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/apiResponse.js"

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

export {registerUser}