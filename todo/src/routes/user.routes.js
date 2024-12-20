import { Router } from "express";
import { changeCurrentPassword,
     getCurrentUser,
      getUserChannelProfile,
       getWatchHistory,
        loginUser,
         logoutUser,
          refreshAccessToken,
           registerUser,
            updateAccountDetails,
             updateUserAvatar,
              updateUsercoverimage } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverimage",
            maxCount: 1,
        }
    ]),
    registerUser)


router.route("/login").post(loginUser)


// secured routes 
router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change_password").post(verifyJWT, changeCurrentPassword)

router.route("/currentuser").get(verifyJWT, getCurrentUser)

router.route("/update_account").patch(verifyJWT, updateAccountDetails)

router.route("/avtar_update").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)

router.route("/cover_image").patch(verifyJWT, upload.single("coverImage"), updateUsercoverimage)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)

router.route("/history").get(verifyJWT, getWatchHistory)



export default router;