import { User } from "../models/user.models.js";
import { ApiError } from "../utility/apiError.js";
import { asyncHandler } from "../utility/asyncHandler.js"; 
import { uploadonCloudinary } from "../utility/cloudinary.js";
import { ApiResponse } from "../utility/apiResponse.js";

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

const {fullname,username,email,password} = req.body
console.log(fullname,email,password);

// if(fullname === ""){
//     throw new ApiError(400,"fullname is required");
// }

if(
    [fullname,email,username,password].some((field)=>field?.trim() === "")
){
throw new ApiError("400", "All fields are required")
}


const exitedUser = User.findOne({
    $or: [{username}, {email}]
})


if(exitedUser){
    throw new ApiError("409", "user with email or username is already exits")
}

const avatatLocalPath = req.files?.avatar[0]?.path;
const coverimageLocalpath = req.files?.userImage[0]?.path;
console.log(avatatLocalPath);

if(avatatLocalPath){
    throw new ApiError(400, "Avatar file is required")
}

 const avatar = await uploadonCloudinary(avatatLocalPath)
 const coverImage = await uploadonCloudinary(coverimageLocalpath)

 if(!avatar){
    throw new ApiError(400, "Avatar file is required")

 }

  const user = await User.create({
    fullname,
    avatar:avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
 })

 const createduser = await User.findById(user._id).select(
    "-password -refreshToken "
 )

 if(!createduser){
    throw new ApiError(500,  "Something went wrong while registering the user")
 }

 return res.status(201).json(
    new ApiResponse(200,createduser,"User registered Successfully")
 )


});

export { registerUser };

