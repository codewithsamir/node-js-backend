import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { likedBy } = req.body;

    if (!videoId || !likedBy) {
        throw new ApiError(400, "Video ID and likedBy are required");
    }

    const prevlike = await Like.findOne({ videoId, likedBy });

    if (prevlike) {
        const deletelike = await Like.deleteOne({ videoId, likedBy });

        return res.status(200).json(
            new ApiResponse(200, deletelike, "Like successfully removed")
        );
    } else {
        const newlike = await Like.create({ videoId, likedBy });

        return res.status(201).json(
            new ApiResponse(201, newlike, "Like successfully added")
        );
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { likedBy } = req.body;

    if (!commentId || !likedBy) {
        throw new ApiError(400, "Comment ID and likedBy are required");
    }

    const comment = await Like.findOne({ commentId, likedBy });

    if (comment) {
        const prevlike = await Like.deleteOne({ commentId, likedBy });

        return res.status(200).json(
            new ApiResponse(200, prevlike, "Like successfully removed")
        );
    } else {
        const newlike = await Like.create({ commentId, likedBy });

        return res.status(201).json(
            new ApiResponse(201, newlike, "Like successfully added")
        );
    }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { likedBy } = req.body;

    if (!tweetId || !likedBy) {
        throw new ApiError(400, "Tweet ID and likedBy are required");
    }

    const tweet = await Like.findOne({ tweetId, likedBy });

    if (tweet) {
        const prevlike = await Like.deleteOne({ tweetId, likedBy });

        return res.status(200).json(
            new ApiResponse(200, prevlike, "Like successfully removed")
        );
    } else {
        const newlike = await Like.create({ tweetId, likedBy });

        return res.status(201).json(
            new ApiResponse(201, newlike, "Like successfully added")
        );
    }
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const { userId } = req.user;

    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }

    const likedVideos = await Like.find({ likedBy: userId, videoId: { $exists: true } })
        .populate("videoId", "title descriptions thumbnail duration views owner")
        .sort({ createdAt: -1 })
        .exec();

    if (!likedVideos || likedVideos.length === 0) {
        throw new ApiError(404, "No liked videos found");
    }

    return res.status(200).json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
};
