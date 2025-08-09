import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {AsyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = AsyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Video Id is not valid")
    }
    
    if (req.user?._id.toString() === videoId){
        throw new ApiError(400, "User cannot like their own video")
    }

    const existingLike = await Like.findOne({
        LikedBy: req.user._id,
        video: videoId
    })
    if (existingLike) {
        await Like.deleteOne({_id: existingLike._id})
        return res.status(200).json(
            new ApiResponse(200, null, "Like removed successfully") 
    )
}   else {
    const newLike = await Like.create({
        LikedBy: req.user._id,
        video: videoId
    })
    return res.status(201).json(
        new ApiResponse(201, newLike, "Video liked successfully")
    )
}
    


})

const toggleCommentLike = AsyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "comment Id is not valid")
    }
    
    if (req.user?._id.toString() === commentId){
        throw new ApiError(400, "User cannot like their own comment")
    }

    const existingLike = await Like.findOne({
        LikedBy: req.user._id,
        comment: commentId
    })
    if (existingLike) {
        await Like.deleteOne({_id: existingLike._id})
        return res.status(200).json(
            new ApiResponse(200, null, "Like removed successfully") 
    )
}   else {
    const newLike = await Like.create({
        LikedBy: req.user._id,
        comment: commentId
    })
    return res.status(201).json(
        new ApiResponse(201, newLike, "comment liked successfully")
    )
}


})

const toggleTweetLike = AsyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet


    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "tweet Id is not valid")
    }
    
    if (req.user?._id.toString() === tweetId){
        throw new ApiError(400, "User cannot like their own comment")
    }

    const existingLike = await Like.findOne({
        LikedBy: req.user._id,
        tweet: tweetId
    })
    if (existingLike) {
        await Like.deleteOne({_id: existingLike._id})
        return res.status(200).json(
            new ApiResponse(200, null, "Tweet removed successfully") 
    )
}   else {
    const newLike = await Like.create({
        LikedBy: req.user._id,
        tweet: tweetId
    })
    return res.status(201).json(
        new ApiResponse(201, newLike, "tweet liked successfully")
    )
}
}
)

const getLikedVideos = AsyncHandler(async (req, res) => {
    //TODO: get all liked videos

   const likeVideo = await Like.find({LikedBy:req.user._id , video:{$ne:null}}).populate("video")

 

   return res.status(200).json(
       new ApiResponse(200, likeVideo, "Liked videos fetched successfully")
   )

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}