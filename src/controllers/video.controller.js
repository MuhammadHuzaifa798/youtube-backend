import { ApiError } from "../utils/apiError.js";
import {AsyncHandler} from "../utils/asyncHandler.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {uploadOnCloudinary, deleteFromCloudinary} from "../utils/cloudinary.js"
import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import {Video} from "../models/video.model.js"
import { getVideoDurationInSeconds } from 'get-video-duration';


const publishAVideo = AsyncHandler(async (req, res) => {
  try {
    const { title, description } = req.body;
    console.log("Title:", title, "Description:", description);

    if (!title && !description) {
      throw new ApiError(400, "Title and description are required");
    }

    const videofilepath = req.files?.videoFile?.[0]?.path;
    if (!videofilepath) {
      throw new ApiError(400, "Video file is required");
    }
    console.log("Video path:", videofilepath);

    const tumbnailFilePath = req.files?.thumbnail?.[0]?.path;
    if (!tumbnailFilePath) {
      throw new ApiError(400, "Thumbnail file is required");
    }
    console.log("Thumbnail path:", tumbnailFilePath);

    const duration = await getVideoDurationInSeconds(videofilepath);
    console.log("Video Duration:", duration);

    const videofileuplaodResponse = await uploadOnCloudinary(videofilepath);
    if (!videofileuplaodResponse) {
      throw new ApiError(500, "Failed to upload video file");
    }

    const thumbnailUploadResponse = await uploadOnCloudinary(tumbnailFilePath);
    if (!thumbnailUploadResponse) {
      throw new ApiError(500, "Failed to upload thumbnail file");
    }

    const video = await Video.create({
      videoFile: videofileuplaodResponse.url,
      thumbnail: thumbnailUploadResponse.url,
      title,
      description,
      duration: duration,
      views: 0,
      isPublished: true,
      owner: req.user._id
    });

    const createdVideo = await Video.findById(video._id);

    return res.status(201).json(
      new ApiResponse(200, createdVideo, "Video published successfully")
    );
  } catch (err) {
    console.error("Error in publishAVideo:", err);
    return res.status(500).json(new ApiError(500, err.message || "Internal Server Error"));
  }
});



const getVideoById = AsyncHandler(async (req, res) => {
    const videoId  = req.params.id
    console.log(videoId)
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $inc: { views: 1 } // Increment views count
        },
        {
            new: true,
            populate: { path: "owner", select: "username fullName email" } // Populate owner details
        }
    )
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched and update views successfully"))
})

const updateVideo = AsyncHandler(async (req, res) => {
    const videoId  = req.params.id
    //TODO: update video details like title, description, thumbnail

    const { title, description } = req.body
    console.log(title , description)
    if (!title && !description) {   
        throw new ApiError(400, "Title or description is required for update");
    }   
    const tumbnailFilePath = req.file?.path;
    console.log(tumbnailFilePath)
    if (!tumbnailFilePath) {
        throw new ApiError(400, "Thumbnail file is required for update");
    }
    

    const oldvideo = await Video.findById(videoId)
     

    deleteFromCloudinary(oldvideo.thumbnail);

    const thumbnailUploadResponse = await uploadOnCloudinary(tumbnailFilePath);


    const video = await Video.findByIdAndUpdate(
        videoId,
        {
           $set : {
            title,
            description,
            thumbnail : thumbnailUploadResponse.url}
        },
        {
            new : true,
        }
    )
   
    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video updated successfully"))
     

})

const deleteVideo = AsyncHandler(async (req, res) => {
    const videoId  = req.params.id


    //TODO: delete video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video  = await Video.findByIdAndDelete(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Delete video file from cloudinary
    await deleteFromCloudinary(video.videoFile);

    // Delete thumbnail file from cloudinary
    await deleteFromCloudinary(video.thumbnail);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Video deleted successfully"))
})


const togglePublishStatus = AsyncHandler(async (req, res) => {
    const  videoId  = req.params.id

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId)

    if (!video){
        throw new ApiError(400, "video not found")
    }

    video.isPublished = !video.isPublished

    await video.save({validateBeforeSave:false})

    return res 
    .status(200)
    .json(
        new ApiResponse(200,video,`Video is now ${video.isPublished ? 'published' : 'unpublished'}`)
    )
})

const getAllVideos = AsyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const pageNumber = parseInt(page);
    const limitNumber= parseInt(limit)

    if (pageNumber <1 || limitNumber < 1) {
        throw new ApiError(400,"invalid page or limit number")
    }
    
    const searchCriteria = {}
    if (query){
       
           searchCriteria.$or = [
                { title: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } }
            ]

    }

    if(userId){
        searchCriteria.owner = mongoose.Types.ObjectId(userId)
    }
     
    const options = {
    page: pageNumber,
    limit: limitNumber
  };

    const result = await Video.aggregatePaginate(
     [ {$match : searchCriteria},
        {$lookup : {
            from : "users",
            foreignField : "_id",
            localField : "owner",
            as : "owner",
            pipeline: [
                { $project: { username: 1, fullName: 1, email: 1 } }
            ]
        }},
        {$unwind : "$owner"}
        ,
        {$sort : { [sortBy || "createdAt"]: sortType === "desc" ? -1 : 1}}


     ]
    ,options)


    return res
    .status(200)
    .json(
        new ApiResponse(200,result,"get all user succesfully")
    )
             





})





export { publishAVideo, getVideoById, updateVideo , deleteVideo , getAllVideos , togglePublishStatus}