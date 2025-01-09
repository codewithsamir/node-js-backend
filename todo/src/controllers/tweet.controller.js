import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    // Extract content and userId from the request body
    const { content, userId } = req.body;

    // Validate required fields
    if (!content || !userId) {
        throw new ApiError(400, "Content and userId are required.");
    }

    // Create a new tweet
    const tweet = await Tweet.create({
        content,
        owner: userId,
    });

    // Check if the tweet creation was successful
    if (!tweet) {
        throw new ApiError(500, "Failed to create the tweet. Please try again.");
    }

    // Return the newly created tweet in the response
    return res.status(201).json(
        new ApiResponse(201, tweet, "Tweet created successfully.")
    );
});


const getUserTweets = asyncHandler(async (req, res) => {
    // Get user tweets
    const { userid } = req.params;

    // Validate userid
    if (!userid) {
        throw new ApiError(400, "User ID is required");
    }

    // Fetch tweets for the user
    const alltweet = await Tweet.find({ owner: userid });

    // Check if tweets exist
    if (!alltweet || alltweet.length === 0) {
        throw new ApiError(404, "No tweets available for the specified user");
    }

    // Return response
    return res.status(200).json(
        new ApiResponse(200, alltweet, "Successfully retrieved all tweets")
    );
});


const updateTweet = asyncHandler(async (req, res) => {
    // Update tweet
    const { tweetid, content } = req.body;

    // Validate inputs
    if (!tweetid || !content) {
        throw new ApiError(400, "Tweet ID and content are required");
    }

    // Update the tweet
    const updatedtweet = await Tweet.findByIdAndUpdate(
        tweetid,
        {
            $set: { content },
        },
        { new: true } // Return the updated document
    );

    // Check if the update was successful
    if (!updatedtweet) {
        throw new ApiError(404, "Failed to update the tweet. Tweet not found.");
    }

    // Return success response
    return res.status(200).json(
        new ApiResponse(200, updatedtweet, "Successfully updated your tweet")
    );
});


const deleteTweet = asyncHandler(async (req, res) => {
    // Delete tweet
    const { tweetid } = req.body;

    // Validate input
    if (!tweetid) {
        throw new ApiError(400, "Tweet ID is required");
    }

    // Attempt to delete the tweet
    const deletetweet = await Tweet.findByIdAndDelete(tweetid);

    // Check if the tweet was deleted
    if (!deletetweet) {
        throw new ApiError(404, "Tweet not found or already deleted");
    }

    // Return success response
    return res.status(200).json(
        new ApiResponse(200, deletetweet, "Successfully deleted your tweet")
    );
});


export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
