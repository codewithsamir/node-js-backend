import { User } from "../models/user.models.js";
import { ApiError } from "../utility/apiError.js";
import { asyncHandler } from "../utility/asyncHandler.js";
import jwt from 'jsonwebtoken'


export const verifyJWT = asyncHandler( async (req, _, next)=>{
  try {
      const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")
  
      if(!token){
          throw new ApiError(401, "Unauthorized request");
      }
  
  const decodedToken =  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
  
  const user = await User.findById(decodedToken?._id).
  select("-refreshToken -password")
  
  if(!user){
      throw new ApiError(401, "invalid access token")
  }
  
  req.user = user;
  next()
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token")
  }

    
})