import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {AsyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = AsyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page , limit } = req.query
    const pageNumber = Math.max(1, parseInt(page));
    const limitNumber = Math.max(1, parseInt(limit));

    if (isNaN(pageNumber) || isNaN(limitNumber)) {
        throw new ApiError(400, "Invalid pagination parameters");
    }

    const comments = await Comment.find({ video: videoId })
        .sort({ createdAt: -1 }) // Sort by creation date, newest first
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .populate("owner", "username fullName email avatar")

    return res.status(200).json(
        new ApiResponse(200, comments, "Comments fetched successfully")
    );
})

const addComment = AsyncHandler(async (req, res) => {
    // Destructure videoId from URL params and content from request body
    const { videoId } = req.params;
    const { content } = req.body;

    // Validate videoId and content
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content is required");
    }

    const userId = req.user?._id;

    const newComment = await Comment.create({
        content: content.trim(),
        owner: userId,
        video: videoId
    })

    return res.status(200).json(
        new ApiResponse(200, newComment, "Comment added successfully")
    );

})

const updateComment = AsyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {content} = req.body

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const comment = await Comment.findById(
        commentId
    )

    if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to edit this comment");
   }
   comment.content = content.trim() || Comment.content;
   const updateComment = await comment.save({validateBeforeSave:false})


    return res.status(200).json(
        new ApiResponse(200, updateComment, "Comment updated successfully")
    );

})

const deleteComment = AsyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    
    }
    const comment = await Comment.findById(commentId);
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this comment");
    }
    const deleteComment = await comment.deleteOne();
    return res.status(200).json(
        new ApiResponse(200, deleteComment, "Comment deleted successfully")
    );
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }