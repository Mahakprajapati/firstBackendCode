import { Video } from "../models/videos.models.js";
import { ApiResponse } from "../utilities/ApiResponse.js";
import { asyncHandler } from "../utilities/asyncHandler.js";
import { uploadOnCloudinary } from "../utilities/cloudinary.js";
import { ApiError } from "../utilities/ErrorHandler.js";

const uploadVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (title == "" || description == "") {
    throw new ApiError(400, "fill all fields");
  }

  if (!(title && description)) {
    throw new ApiError(400, "Title and description are required");
  }

  const videoFileLocalPath = req.files?.videoFile[0].path;
  const thumbnailLocalPath = req.files?.thumbnail[0].path;

  //   console.log(`videoFileLocalPath : ${videoFileLocalPath}`);
  //   console.log(`thumbnailLocalPath : ${thumbnailLocalPath}`);

  if (!(videoFileLocalPath && thumbnailLocalPath)) {
    throw new ApiError(400, "Video and thumbnail are required");
  }

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  //   console.log(`videoFile : ${videoFile}`);
  //   console.log(`thubnail : ${thumbnail}`);

  if (!videoFile) {
    throw new ApiError(409, "Video are required");
  }
  if (!thumbnail) {
    throw new ApiError(409, "Thumbnail are required");
  }

  const video = await Video.create({
    videoFile: videoFile?.url,
    thumbnail: thumbnail?.url,
    title,
    description,
  });

  //   console.log(`Video : ${video}`);

  if (!video) {
    throw new ApiError(400, "Video is not created");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Video is successfully uploaded", video));
});

export { uploadVideo };
