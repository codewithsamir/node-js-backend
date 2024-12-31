import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { uploadonCloudinary } from "../utility/cloudinary.js"
import { json } from "stream/consumers"



const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    
    //TODO: get all videos based on query, sort, pagination
    // Check if userId is provided
    if (!userId) {
        throw new ApiError(404, 'UserId is required');                 
    }

    // Calculate pagination values
    const skip = (page - 1) * limit;
    const totalCount = await Video.countDocuments({ userId }); // Count total videos
    const totalPages = Math.ceil(totalCount / limit); // Calculate total pages

    // Build query for video retrieval
    let filter = { userId };
    if (query) {
        // If query is provided, filter by the query (can be based on title or any field)
        filter = { ...filter, title: { $regex: query, $options: 'i' } }; // Example: search by title
    }

    // Build sort object if sort parameters are provided
    let sort = {};
    if (sortBy && sortType) {
        sort[sortBy] = sortType === 'desc' ? -1 : 1; // Apply sorting by field and type
    }

    // Fetch videos with pagination, filtering, and sorting
    const videos = await Video.find(filter)
        .skip(skip)
        .limit(Number(limit))
        .sort(sort);

    // If no videos are found
    if (!videos || videos.length === 0) {
        throw new ApiError(400, "Videos not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {
            videos,
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalCount
            }
        }, "Successfully fetched all videos")
    );
});


const publishAVideo = asyncHandler(async (req, res) => {
    // If 'user' is part of the request body, use req.body.user. If it's in params, req.params.user is correct.    const { user } = req.params; // Ensure you're passing the user correctly through the route
    const { title, descriptions,user } = req.body;

    // Check if all required fields are provided
    if (!title || !descriptions || user) {
        throw new ApiError(400, "All fields are required");
    }

    // Get video and thumbnail file paths
    const videoLocalPath = req.files?.videofile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path; // Corrected spelling here

    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Video and thumbnail are required");
    }

    // Upload video and thumbnail to Cloudinary
    const video = await uploadonCloudinary(videoLocalPath);
    const thumbnail = await uploadonCloudinary(thumbnailLocalPath);

    // Check if video upload is successful
    if (!video) {
        throw new ApiError(402, "Video is not uploaded");
    }

    // Create the video record in the database
    const publicVideo = await Video.create({
        videofile: video.url,
        thumbnail: thumbnail.url, // Corrected spelling here
        title,
        descriptions,
        duration: video.duration, // Consider using ffmpeg or another method if duration is not available
        owner: user,
    });

    // Check if the video creation failed
    if (!publicVideo) {
        throw new ApiError(402, "Video could not be uploaded, try again");
    }

    // Return the successful response
    return res.status(201).json(
        new ApiResponse(201, publicVideo, "Successfully published video")
    );
});


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Check if videoId is provided
    if (!videoId) {
        throw new ApiError(400, "Video ID is required.");
    }

    // Fetch video by ID
    const video = await Video.findById(videoId);

    // Check if video exists
    if (!video) {
        throw new ApiError(404, "Video is not available.");
    }

    // Return the video in the response
    return res.status(200).json(
        new ApiResponse(200, video, "Video found successfully.")
    );
});


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title,descriptions}= req.body;
    const thumbnailpath = req.files?.path;

    if(!thumbnailpath){
        throw new ApiError(400, "thumbail is missing");
    }
    const thumbailurl = await uploadOnCloudinary(thumbnailpath)

    if(!videoId){
        throw new ApiError(400,"Video Id is required!");
    }



    const video = await Video.findByIdAndUpdate(videoId,{
        $set:{
            title,
            descriptions,
            thumbnail:thumbailurl.url
        }
    });

    if(!video){
        throw new ApiError(400,"Video is not avaiable!");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Successfully update data")
    )



})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Check if videoId is provided
    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    // Attempt to delete the video
    const deletedvideo = await Video.findByIdAndDelete(videoId);

    // Check if the video was successfully deleted
    if (!deletedvideo) {
        throw new ApiError(400, "Video could not be deleted or does not exist");
    }

    // Return a success response
    return res
        .status(200)
        .json(
            new ApiResponse(200, deletedvideo, "Successfully deleted video")
        );
});


const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId){
        throw new ApiError(400,"video id is required")
    }
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
