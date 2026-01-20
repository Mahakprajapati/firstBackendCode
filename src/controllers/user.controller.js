import { User } from "../models/user.models.js";
import { asyncHandler } from "../utilities/asyncHandler.js";
import { ApiError } from "../utilities/ErrorHandler.js";
import { uploadOnCloudinary } from "../utilities/cloudinary.js";
import { ApiResponse } from "../utilities/ApiResponse.js";

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

export { registerUser };
