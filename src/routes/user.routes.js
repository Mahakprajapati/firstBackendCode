import { Router } from "express";
import {
  registerUser,
  deleteAcount,
  deleteCoverImage,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateFullname,
  updateEmail,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleare.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secure route
router.route("/logout").get(verifyJWT, logoutUser);
router.route("/delete-account").delete(verifyJWT, deleteAcount);
router.route("/delete-coverImage").delete(verifyJWT, deleteCoverImage);
router.route("/refresh-token").post(refreshAccessToken);
//
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-email").patch(verifyJWT, updateEmail);
router.route("/update-fullname").patch(verifyJWT, updateFullname);

//
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/coverImage")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
router.route("/user-profile/:userName").get(verifyJWT, getUserChannelProfile);
router.route("/watch-history").get(verifyJWT, getWatchHistory);

export default router;
