import { User } from "../models/user.models.js";
import { ApiError } from "../utility/apiError.js";
import { asyncHandler } from "../utility/asyncHandler.js";
import { uploadonCloudinary } from "../utility/cloudinary.js";
import { ApiResponse } from "../utility/apiResponse.js";
import jwt from "jsonwebtoken";
import { response } from "express";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
  // console.log(userId);

  try {
    const user = await User.findById(userId);

    const accesstoken = user.generateAccessToken();
    const refreshtoken = user.generateRefreshToken();

    user.refreshToken = refreshtoken;
    await user.save({ validateBeforeSave: false });

    return { accesstoken, refreshtoken };
  } catch (error) {
    // console.log(error);

    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // res.status(200).json({
  //     message: "code with samir",
  // });

  //    get user details from frontend
  // validation - not empty
  // check if user already exits username, email
  //check for images , check for avatar
  // upload them to cloudnary
  //create user object - create entry in db
  //remove password and refresh token field from response token
  //check for user creation
  //return response

  const { fullname, username, email, password } = req.body;
  // console.log(fullname,email,password);

  // if(fullname === ""){
  //     throw new ApiError(400,"fullname is required");
  // }

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError("400", "All fields are required");
  }

  const exitedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (exitedUser) {
    throw new ApiError("409", "user with email or username is already exits");
  }

  const avatatLocalPath = req.files?.avatar[0]?.path;
  // const coverimageLocalpath = req.files?.coverimage[0]?.path;
  // console.log(avatatLocalPath);

  let coverimageLocalpath;
  if (
    req.files &&
    Array.isArray(req.files.coverimage) &&
    req.files.coverimage.length > 0
  ) {
    coverimageLocalpath = req.files.coverimage[0].path;
  }

  if (!avatatLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadonCloudinary(avatatLocalPath);
  const coverImage = await uploadonCloudinary(coverimageLocalpath);
  //  console.log(avatar);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverimage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createduser = await User.findById(user._id).select(
    "-password -refreshToken "
  );

  if (!createduser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createduser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  // console.log(user);

  if (!user) {
    throw new ApiError(404, "user Doesn't exit");
  }

  const isPasswordvalid = await user.isPasswordCorrect(password);

  if (!isPasswordvalid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accesstoken, refreshtoken } = await generateAccessAndRefreshTokens(
    user._id
  );
  // console.log(accesstoken, refreshtoken);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accesstoken, options)
    .cookie("refreshToken", refreshtoken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accesstoken,
          refreshtoken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // cookies remove
  // delete refresh token

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user successfully logout"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh Token");
    }
    // console.log(incomingRefreshToken, "token : " ,user?.refreshToken)
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or userid");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accesstoken, refreshtoken } = await generateAccessAndRefreshTokens(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accesstoken, options)
      .cookie("refreshToken", refreshtoken, options)
      .json(
        new ApiResponse(
          200,
          { accesstoken, refreshtoken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const ispasswordcorrect = await user.isPasswordCorrect(oldPassword);

  if (!ispasswordcorrect) {
    ApiError("400", "Invalid old password ");
  }

  user.password = newPassword;
  await user.save({
    validateBeforeSave: false,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password change successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (!username || !email) {
    throw new ApiError(400, "All fields are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email: email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarlocalpath = req.file?.path;
  if (!avatarlocalpath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadonCloudinary(avatarlocalpath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
  .status(200)
  .json(new ApiResponse(200, user, "avatar updated successfully"));
});

const updateUsercoverimage = asyncHandler(async (req, res) => {
    const coverimagelocalpath = req.file?.path;
    if (!coverimagelocalpath) {
      throw new ApiError(400, "coverimage file is missing");
    }
  
    const coverimage = await uploadonCloudinary(avatarlocalpath);
  
    if (!coverimage.url) {
      throw new ApiError(400, "Error while uploading on coverimage");
    }
 const user =     await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
            coverimage: coverimage.url,
        },
      },
      { new: true }
    ).select("-password");

    return res
    .status(200)
    .json(new ApiResponse(200, user, "coverimage updated successfully"));
  });

const getUserChannelProfile = asyncHandler( async (req,res)=>{
 const {username} = req.params;

 if(!username?.trim())
    {
        throw new ApiError(400, "username is missing");
    }

   const channel = await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
          $lookup:{
            from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
          }
        },
        {
          $addFields:{
            subscribersCount:{
              $size:"$subscribers"
            },
            channelsSubscribedToCount:{
              $size:"$subscribedTo"
            },
            isSubscribed:{
              $cond:{
                if:{$in: [req.user?._id, "$subscribers.subscriber"]},
                then:true,
                else:false,
              }
            }
          }
        },
        {
          $project:{
            fullname:1,
            username:1,
            subscribersCount:1,
            channelsSubscribedToCount:1,
            isSubscribed:1,
            avatar:1,
            coverImage:1,
            email:1,


          }
        }
    ])

    console.log(channel);

    if(!channel?.length){
      throw new ApiError(404, "channel does not exit")
    }

    return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "user channel fetch successfully")
    )

})

const getWatchHistory = asyncHandler ( async (req,res)=>{
  const user = await User.aggregate([
    {
      $match:{
        _id:new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup:{
        from:"videos",
        localField:"watchHistory",
        foreignField:"_id",
        as:"watchHistory",
        pipeline:[
          {
            $lookup:{
              from:"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner",

              pipeline:[
                {
                  $project:{
                    fullname:1,
                    username:1,
                    avatar:1,

                  }
                },
                {
                  $addFields:{
                    owner:{
                      $first:"$owner"
                      
                      
                    }
                  }
                }
              ]

            }
          }
        ]
      }
    }

  ])

  return res
  .status(200)
  .json(
    new ApiResponse(200,user[0].watchHistory,"watch history fetched")
  )
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUsercoverimage,
  getUserChannelProfile,
  getWatchHistory
};

                                                                                                      




