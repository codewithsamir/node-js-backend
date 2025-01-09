import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    

    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }

    const skip = (page - 1) * limit;
    const filter = query
        ? { userId, title: { $regex: query, $options: "i" } }
        : { userId };
    const sort = sortBy ? { [sortBy]: sortType === "desc" ? -1 : 1 } : {};

    const totalCount = await Video.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const videos = await Video.find(filter)
        .skip(skip)
        .limit(Number(limit))
        .sort(sort);

    if (!videos.length) {
        throw new ApiError(404, "No videos found");
    }

    return res.status(200).json(
        new ApiResponse(200, { videos, pagination: { page, totalPages, totalCount } }, "Videos fetched successfully")
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, descriptions, user } = req.body;

    if (!title || !descriptions || !user) {
        throw new ApiError(400, "All fields are required");
    }

    const videoLocalPath = req.files?.videofile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Video and thumbnail files are required");
    }

    const video = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    const publicVideo = await Video.create({
        videofile: video.url,
        thumbnail: thumbnail.url,
        title,
        descriptions,
        duration: video.duration,
        owner: user,
    });

    return res.status(201).json(
        new ApiResponse(201, publicVideo, "Video published successfully")
    );
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Video retrieved successfully")
    );
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, descriptions } = req.body;
    const thumbnailPath = req.files?.thumbnail[0]?.path;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    if (!thumbnailPath) {
        throw new ApiError(400, "Thumbnail is required");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailPath);

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: { title, descriptions, thumbnail: thumbnail.url },
        },
        { new: true }
    );

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Video updated successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId);

    if (!deletedVideo) {
        throw new ApiError(404, "Video not found or already deleted");
    }

    return res.status(200).json(
        new ApiResponse(200, deletedVideo, "Video deleted successfully")
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { isPublished } = req.body;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const togglePublish = await Video.findByIdAndUpdate(
        videoId,
        { $set: { isPublished } },
        { new: true }
    );

    if (!togglePublish) {
        throw new ApiError(404, "Video not found or failed to update");
    }

    return res.status(200).json(
        new ApiResponse(200, togglePublish, "Publish status updated successfully")
    );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
