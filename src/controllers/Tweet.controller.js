import { ApiError } from "../utils/apiError.js";
import {AsyncHandler} from "../utils/asyncHandler.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {uploadOnCloudinary, deleteFromCloudinary} from "../utils/cloudinary.js"
import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import {Video} from "../models/video.model.js"
import {Tweet} from "../models/tweet.model.js"


const createTweet = AsyncHandler(async(req , res) =>{
    const {content} = req.body
     
    const tweet = await Tweet.create({
          content : content,
          owner : req.user?._id
    })

    const tweetcreated = await Tweet.findById(
        tweet._id,

    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweetcreated,
            "tweet created succesccfully"
        )
    )

})

const getUserTweets = AsyncHandler(async (req, res) => {
    // TODO: get user tweets
   const UserId = req.params.userId

   if (!isValidObjectId(UserId)) {
       return (new ApiError(400, "Invalid tweet ID"))
   }

   try {

   const tweetwithuser = await Tweet.aggregate([
    {
        $match : {
            owner  : new mongoose.Types.ObjectId(UserId)
        }
    },
    {    
        $lookup:{
            from : "users",
            localField : "owner",
            foreignField : "_id",
            as : "owner",
            pipeline:[
                {
                    $project : {
                        username:1,
                        fullName : 1,
                        avatar : 1,

                    }
                }
            ]
        }

    },{
        $unwind : "$owner"
    }

  ])


  return res 
    .status(200)    
    .json(
        new ApiResponse(
            200,
            tweetwithuser,
            "user tweets fetched successfully"
        )
    )
} catch (error) {
    throw new ApiError(500, error.message, "Internal server error")
   }


})


const updateTweet = AsyncHandler(async (req, res) => {
    const tweetId = req.params.tweetId
    const {content} = req.body

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set : {
                content : content
            }
        },{
            new : true
        }
    )


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweet,
            "tweet update successfully"
        )
    )
})

const deleteTweet = AsyncHandler(async (req, res) => {
    const tweetId = req.params.tweetId
    try{
        const deleteTweet = await Tweet.findByIdAndDelete(
            tweetId
        )
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deleteTweet,
                "tweet deleted successfully"
            )
        )
    }catch(error){
        throw new ApiError(500, error.message, "Internal server error")
    }

})


export {
    createTweet,updateTweet,getUserTweets,deleteTweet
}