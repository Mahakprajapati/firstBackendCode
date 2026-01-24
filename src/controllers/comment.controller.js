import { asyncHandler } from "../utilities/asyncHandler.js";
import { ApiError } from "../utilities/ErrorHandler.js";
import { ApiResponse } from "../utilities/ApiResponse.js";
import Comment from "../models/comments.models.js";

const postComment = asyncHandler(async (req, res) => {
  const { context } = req.body;

  if (!context || context == "") {
    throw new ApiError(400, "comment is required");
  }

  const comment = await Comment.create({
    context,
  });

  if (!comment) {
    throw new ApiError(400, "Write your comment");
  }
  return res.status(200).json(new ApiResponse(200, "Commented successfully"));
});

export { postComment };
