import { User } from "../models/user.models.js";
import { asyncHandler } from "../utilities/asyncHandler.js";
import { ApiError } from "../utilities/ErrorHandler.js";
import { uploadOnCloudinary } from "../utilities/cloudinary.js";
import { ApiResponse } from "../utilities/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const ganerateAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = user.ganerateAccessToken();
  const refreshToken = user.ganerateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

const registerUser = asyncHandler(async (req, res) => {
  //get the user details from frontend
  //validation- Not Empty
  //check if user exist ,userName ,email
  //check for coverImage, check avatar
  //Upload them cloudinary, avatar and coverimage
  //Create user Object  - create entry in db
  //remove password,refreshToken field from response
  //check for user creation
  //return res

  //get the user details from frontend
  const { fullName, userName, email, password } = req.body;

  console.log(fullName, userName, email, password);

  //validation- Not Empty
  if (fullName === "") {
    throw new ApiError(400, "not be empty");
  }

  if ([userName, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "all fields are required");
  }

  //validation email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email) {
    if (!emailRegex.test(email)) {
      throw new ApiError(400, "email is required");
    }
  }

  //check if user exist ,userName ,email
  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });
  // console.log("ExistedUser", existedUser);

  if (existedUser) {
    throw new ApiError(409, "User with username and email is already exist");
  }

  //check for coverImage, check avatar
  // console.log(req.files?.avatar?.length);
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  // console.log("req.files :", req.files.avatar[0].fieldname);

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  //Upload them cloudinary, avatar and coverimage
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  //Create user Object  - create entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    userName: userName.toLowerCase(),
    email,
    password,
  });

  //remove password,refreshToken field from response
  const createdUser = await User.findById(user._id).select(
    "-refreshToken -password"
  );

  //check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registration the user");
  }

  //return response
  return res
    .status(201)
    .json(new ApiResponse(200, "User Registered Successfully", createdUser));
});

const loginUser = asyncHandler(async (req, res) => {
  //get email and password from req.body
  //validation - not empty
  //check password and email is valid
  //access and refresh atoken
  //sent token in cookies

  const { email, userName, password } = req.body;

  if ([email, userName].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "all fields are required");
  }
  // if (!email && !userName) {
  //   throw new ApiError(400, "all fields are required");
  // }

  const user = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (!user) {
    throw new ApiError(404, "email and password are not exist.");
  }
  // console.log("Password :", password);

  //Boolean answer
  const hashedpassword = await user.isPasswordCorrect(password);

  // console.log("hashedpassword", hashedpassword);

  if (!hashedpassword) {
    throw new ApiError(401, "Password is Incorrect.");
  }

  const { accessToken, refreshToken } = await ganerateAccessAndRefreshToken(
    user._id
  );

  const ExistedUser = await User.findById(user._id).select(
    "-refreshToken -password"
  );

  // console.log(
  //   `AccessToken :${accessToken} , RefreshToken : ${refreshToken} and User : ${ExistedUser}`
  // );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "User loggedIn successfully", {
        ExistedUser,
        accessToken,
        refreshToken,
      })
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const user = req.user;

  await User.findByIdAndUpdate(user._id, {
    $set: {
      refreshToken: undefined,
    },
  });
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, " User Logged Out", {}));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incommingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incommingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request");
  }

  //Encoded Or Raw data and Decoded check on jwt.io by search
  const decodedToken = jwt.verify(
    incommingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decodedToken._id);

  if (incommingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "Refresh Token is expired or used");
  }

  const { accessToken, newRefreshToken } = ganerateAccessAndRefreshToken(
    user._id
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(200, "Access Token refreshed", {
        accessToken,
        refreshToken: newRefreshToken,
      })
    );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  // console.log(`oldpassword : ${oldPassword} and newpassword : ${newPassword}`);

  if (!(oldPassword && newPassword)) {
    throw new ApiError(400, "all fields are required");
  }

  // console.log(req.user.fullName);
  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  // console.log("isPasswordCorrect", isPasswordCorrect);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Old password is Incorrect");
  }

  user.password = newPassword;
  await user.save({ validateBeforSave: false });

  return res
    .status(200)
    .json(new ApiResponse(201, "password is successfully updated", user));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "Current user fetched successfully", req.user));
});

const updateFullname = asyncHandler(async (req, res) => {
  const { fullName } = req.body;

  if (!fullName) {
    throw new ApiError(400, "Fullname are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, "FullName are successfully updated"));
});

const updateEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        email,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, "Email are successfully updated"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error While uploading image on cloudinary");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, "Avatar image is successfully updated", user));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error While uploading image on cloudinary");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(
      new ApiResponse(200, "coverImage image is successfully updated", user)
    );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { userName } = req.params; //search on google req.param and req.body
  // console.log("userName", userName);
  if (!userName.trim()) {
    throw new ApiError(400, "username is missing");
  }

  // Discuss aggregation piplines
  const channel = await User.aggregate([
    {
      $match: {
        userName: userName?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subcribersCount: {
          $size: "$subscribers",
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        subcribersCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
        fullName: 1,
        userName: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel does not exists ");
  }
  // console.log("check what channel return :", channel);

  return res
    .status(200)
    .json(new ApiResponse(200, "User channel fetched successfuly", channel[0]));
});

const getWatchHistory = asyncHandler(async (req, res) => {
  console.log("req.user", req.user);
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Schema.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "videos",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    userName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
    {},
  ]);

  console.log("User in aggregation", user);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history fetched successfully"
      )
    );
});

export {
  registerUser,
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
};
