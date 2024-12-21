import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const {likedBy} = req.body;

    if(!videoId || !likedBy) {
        throw new ApiError(400, "VideoId and likedBy are not found");
    }

const prevlike = await Like.findOne({
    videoId,
    likedBy
})

if(prevlike){
 const deletelike =  await  Like.deleteOne({
        videoId,
        likedBy
    })

    return res
    .status(200)
    .json(
        new ApiResponse(201,deletelike, "succesfully  like is removed" )
    )
}else{
    const newlike =  await  Like.create({
        videoId,
        likedBy
    })

    return res
    .status(200)
    .json(
        new ApiResponse(201,newlike, "successfully like is added" )
    )  
}

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}