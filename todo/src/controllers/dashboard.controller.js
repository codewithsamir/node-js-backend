import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Comment} from "../models/comment.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  // Extract userid from request parameters
  const { userid } = req.params;

  // Validate userid
  if (!userid) {
      throw new ApiError(400, "UserId is required!");
  }

  // Aggregation pipeline to calculate video stats
  const state = await Video.aggregate([
      {
          $match: {
              owner: userid, // Filter videos by owner
          },
      },
      {
          $lookup: {
              from: "likes", // Name of the Likes collection
              localField: "_id", // Video ID in the Videos collection
              foreignField: "videoId", // Video ID in the Likes collection
              as: "likesVideo", // Store matching likes in an array
          },
      },
      {
          $group: {
              _id: null, // Group all data together
              totallikes: { $sum: { $size: "$likesVideo" } }, // Sum the size of the likesVideo array
              totalviews: { $sum: "$views" }, // Sum views field
              totalvideo: { $sum: 1 }, // Count total videos
          },
      },
  ]);

  // Count total subscribers from the Subscription collection
  const totalsubscriber = await Subscription.countDocuments({ subscriber: userid });

  // Combine stats into a final object
  const finalstate = {
      totallikes: state[0]?.totallikes || 0, // Use optional chaining to handle empty state
      totalviews: state[0]?.totalviews || 0,
      totalvideos: state[0]?.totalvideo || 0,
      totalsubscriber: totalsubscriber || 0, // Ensure zero if no subscribers
  };

  // Send response
  return res.status(200).json(
      new ApiResponse(200, finalstate, "Successfully retrieved all data")
  );
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const {userid} = req.params;

    if (!userid) {
        throw new ApiError(400, "UserId is required!");
    }

    const totalvideos = await Video.aggregate([
        { $match: { owner: userid } },

        // Lookup likes
        {
            $lookup: {
                from: "likes", // The "likes" collection
                localField: "_id", // The current video _id
                foreignField: "videoId", // The field in the "likes" collection that matches the videoId
                as: "likesData", // Store result in "likesData"
            },
        },

        // Lookup comments
        {
            $lookup: {
                from: "comments", // The "comments" collection
                localField: "_id", // The current video _id
                foreignField: "videoId", // The field in the "comments" collection that matches the videoId
                as: "commentsData", // Store result in "commentsData"
            },
        },

        // Project total likes and comments
        {
            $project: {
                totalLikes: { $size: "$likesData" }, // Count the likes
                totalComments: { $size: "$commentsData" }, // Count the comments
            },
        },
    ]);

    return res.status(200).json(new ApiResponse(200, totalvideos, "Successfully retrieved all videos"));
});


export {
    getChannelStats, 
    getChannelVideos
    }