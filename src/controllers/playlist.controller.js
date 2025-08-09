import {Playlist} from "../models/playlist.model.js";
import {ApiError} from "../utils/apiError.js";
import {ApiResponse} from "../utils/apiResponse.js";
import {AsyncHandler} from "../utils/asyncHandler.js";
import mongoose, {isValidObjectId} from "mongoose";




const createPlaylist = AsyncHandler(async (req, res) => {
    const { name , description } = req.body;
    console.log(name,description)
    //TODO: create playlist
    if(!name || !description){
        throw new ApiError(400, "Name and description are required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        videos : [],
        owner: req.user?._id
    })

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist created successfully")
    )
})

const getUserPlaylists = AsyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "User Id is not valid")
    }
    const playlists = await Playlist.find({owner: userId})
        .populate("videos", "title thumbnail duration ")
        .populate("owner", "username fullName email avatar");

    return res.status(200).json(
        new ApiResponse(200, playlists, "User playlists fetched successfully")  
    )

})

const getPlaylistById = AsyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Playlist Id is not valid")
    }
    const playlist = await Playlist.findById(playlistId)
        .populate("videos", "title thumbnail duration")
        .populate("owner", "username fullName email avatar");
    
    if(!playlist){
        throw new ApiError(404, "Playlist not found")  }

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    )

})

const addVideoToPlaylist = AsyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Playlist Id or Video Id is not valid")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: { videos: videoId } // Use $addToSet to avoid duplicates
        },
        { new: true }

    ).populate("videos")

    return res.status(200).json(
        new ApiResponse(200, playlist, "Video added to playlist successfully")
    )
})


const removeVideoFromPlaylist = AsyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Playlist Id or Video Id is not valid")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: { videos: videoId }
        },
        { new: true }
    ).populate("videos")

    return res.status(200).json(
        new ApiResponse(200, playlist, "Video removed from playlist successfully")
    )
})

const deletePlaylist = AsyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Playlist Id is not valid")
    }

    const deletePlaylist = await Playlist.deleteOne({"_id":playlistId})
    
    return res.status(200).json(
        new ApiResponse(200, deletePlaylist, "Playlist deleted successfully")
    )

})

const updatePlaylist = AsyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Playlist Id is not valid")
    }

    const updatePlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {$set : {
            name : name,
            description : description
        }}
        ,{
            new : true
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatePlaylist,
            "playlist update successfulluy"
        )
    )

    
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}