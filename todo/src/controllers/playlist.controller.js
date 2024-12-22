import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const {userId} = req.params

    //TODO: create playlist

    if(!userId){
        throw new ApiError(404, "user not found")
 }

    if(!name || !description){
        throw new ApiError(400, "All fields are required")
    }

 
    
   const playlist = await Playlist.create({
    name,
    description,
    owner:user
    })

    if(!createPlaylist){
        throw new ApiError(500, "Failed to create playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist created successfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
 //TODO: get user playlists
    // Validate userId
    if (!userId) {
        throw new ApiError(404, "User ID is required");
    }

    // Fetch playlists owned by the user
    const playlists = await Playlist.find({ owner: userId });

    // Check if playlists exist
    if (!playlists || playlists.length === 0) {
        throw new ApiError(404, "No playlists found for the user");
    }

    // Return the response
    return res
        .status(200)
        .json(
            new ApiResponse(200, playlists, "Playlists fetched successfully")
        );
});


const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    //TODO: get playlist by id
    // Validate playlistId
    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required");
    }

    // Fetch the playlist by ID
    const playlist = await Playlist.findById(playlistId);

    // Check if the playlist exists
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Return the response
    return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "Playlist fetched successfully")
        );
});


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    // Validate required fields
    if (!playlistId || !videoId) {
        throw new ApiError(400, "Playlist ID and Video ID are required");
    }

    // Update the playlist and add the video to the Videos array
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: { Videos: videoId }, // Ensures no duplicates
        },
        { new: true } // Returns the updated document
    );

    // Check if playlist exists
    if (!updatedPlaylist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Return success response
    return res.status(200).json(
        new ApiResponse(201, updatedPlaylist, "Video added to playlist successfully")
    );
});


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    // Validate input
    if (!playlistId || !videoId) {
        throw new ApiError(400, "Playlist ID and Video ID are required");
    }

    // Check if the playlist exists
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Update the playlist by removing the videoId from the Videos array
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: { Videos: videoId }, // Correctly removing videoId
        },
        { new: true } // Return the updated playlist
    );

    // Check if the update was successful
    if (!updatedPlaylist) {
        throw new ApiError(404, "Failed to remove the video from the playlist");
    }

    // Return the updated playlist
    return res.status(200).json(
        new ApiResponse(200, updatedPlaylist, "Successfully removed video from playlist")
    );
});


const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    // Validate the playlistId
    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required");
    }

    // Delete the playlist by ID
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

    // Check if the playlist exists and was deleted
    if (!deletedPlaylist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Return success response
    return res.status(200).json(
        new ApiResponse(200, deletedPlaylist, "Playlist successfully deleted")
    );
});


const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!playlistId){
        throw new ApiError(404, "PlaylistId is not found")
    }

    if(!name || !description){
        throw new ApiError(400, "All Fields are required")
    }

    const updateplaylist =  await Playlist.findByIdAndUpdate(playlistId,{
        $set:{
            name,
            description
        }
    },{new :true})

    return res
    .status(200)
    .json(
        new ApiError(201, "successfully updated playlist")
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
