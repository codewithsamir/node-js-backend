import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!videoId){
        throw new ApiError(400,"Videos id is not found");
    }
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video ID format");
    }

    // Calculate the number of comments to skip for pagination
    const skip = (page - 1) * limit;

    const comments = await Comment.find({videoId})
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 })

    if(!comments){
        throw new ApiError(404, "Video is not found ")
    }

    const totalcomments = await Comment.countDocuments({videoId})

    if (totalcomments === 0) {
        throw new ApiError(404, "No comments found for this video");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,{
            data:comments,
            totalcomment:totalcomments,
            page:Number(page),
            limit:Number(limit),
            totalpages:Math.ceil(totalcomments/limit)
        
        },"comment successfully fetched")
    )

    

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content,videoId,owner} = req.body;

    if(!videoId || !content || !owner){
        throw new ApiError(400, "All fields are required");
    }

    const comment =await Comment.create({
        content,
        videoId,
        owner
    })

  

    return res
    .status(200)
    .json(
        new ApiResponse(201, comment, "successfully comment added")
    )


})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentid} = req.params;
    const {content } = req.body;
    if(!content || !commentid){
        throw new ApiError(400, "Content and videoId is required");
    }

    const updatecomment = await Comment.findByIdAndUpdate(commentid,
        {
        $set:{
            content
        }
    },
    {new : true}

)

   // Check if the comment exists
   if (!updatecomment) {
    throw new ApiError(404, "Comment not found");
}

    return res
    .status(200)
    .json(
        new ApiResponse(201, updatecomment, "successfully updated comments")
    )

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentid} = req.params;

    if(!commentid){
        throw new ApiError(400, "Commentid is required")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentid);

    if (!deletedComment) {
        throw new ApiError(404, "Comment not found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201,deletedComment, "successfully deleted")
    )

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
