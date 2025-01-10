import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params;  // Get the channelId from request params
    const userId = req.user?.id;  // Assuming user is authenticated and userId is available in `req.user`

  
    if (!userId) {
        throw new ApiError(401, "User is not authenticated"); // Return error if no userId is found
    }

    if (!channelId) {
        throw new ApiError(400, "ChannelId is required");
    }
    // Check if user is already subscribed to the channel
    const existingSubscription = await Subscription.findOne({
        subscriber: userId,
        channel: channelId,  // Assuming the Subscription model has `channel` field
    });

    if (existingSubscription) {
        // User is already subscribed, so unsubscribe (remove subscription)
        await Subscription.deleteOne({
            subscriber: userId,
            channel: channelId,
        });

        return res.status(200).json(
            new ApiResponse(200, {}, "Successfully unsubscribed from the channel")
        );
    } else {
        // User is not subscribed, so subscribe (create new subscription)
        await Subscription.create({
            subscriber: userId,
            channel: channelId,  // Assuming the Subscription model has `channel` field
        });

        return res.status(200).json(
            new ApiResponse(200, {}, "Successfully subscribed to the channel")
        );
    }
});


// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!channelId){
        throw new ApiError(400, "channelid is required")
    }
    const totalSubscriberlist = await Subscription.find({channel:channelId})
    .populate('subscriber', 'username email profilePicture') // Populating subscriber details
 
    // Check if the subscriber list is empty
    if (totalSubscriberlist.length === 0) {
        throw new ApiError(400, "No subscribers found for this channel");
    }

    // Return the subscriber list with details
    return res.status(200).json(
        new ApiResponse(200, totalSubscriberlist, "Successfully retrieved total subscriber list")
    );
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    // Validate if subscriberId is provided
    if (!subscriberId) {
        throw new ApiError(400, "SubscriberId is required");
    }

    // Find all subscriptions where the given subscriberId is the subscriber
    const totalChannellist = await Subscription.find({ subscriber: subscriberId })
        .populate('channel', 'username email profilePicture'); // Populating channel details

    // Check if the subscriber has no subscriptions (empty list)
    if (totalChannellist.length === 0) {
        throw new ApiError(400, "No channels found for this subscriber");
    }

    // Return the list of channels the user is subscribed to with details
    return res.status(200).json(
        new ApiResponse(200, totalChannellist, "Successfully retrieved subscribed channels")
    );
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}