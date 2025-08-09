import mongoose, {isValidObjectId} from "mongoose"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {AsyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = AsyncHandler(async (req, res) => {
    const channelId = req.params.channelId
    // TODO: toggle subscription
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"channel Id is not vallid")
    }
    
    const subscriberId = req.user?._id

    if(subscriberId.toString()===channelId){
        throw new ApiError(400,"channel does not subscribed to its channel")
    }

    const existingsubscription = await Subscription.findOne(
        {
            subscriber : subscriberId,
            Channel: channelId
        }
    )

    if(existingsubscription){
        await Subscription.deleteOne({_id:existingsubscription._id})
        return res.status(200).json(
            new ApiResponse(200, null, "Unsubscribed successfully"))
    }else{
        const createdsubscription = await Subscription.create(
            {
                 subscriber : subscriberId,
                 Channel: channelId
            }
        )
          
        return res.status(200).json(
            new ApiResponse(200, createdsubscription, "subscribed successfully"))
    }


})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = AsyncHandler(async (req, res) => {
    const channelId = req.params.channelId;
    // Validate ObjectId
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Channel ID is not valid");
    }

    // Fetch subscriber list and populate subscriber details
    const subscriberList = await Subscription.find({ Channel: channelId })
        .populate("subscriber", "username email avatar fullName");
    return res.status(200).json(
        new ApiResponse(200, subscriberList, "Successfully fetched subscriber list")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = AsyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400,"subscriber Id is not vallid")
    }
    const channellist = await Subscription.find({subscriber:subscriberId})
                        .populate("Channel","username fullName email avatar")

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            channellist,
            "Get channel list to which user has subscribed"
        )
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}