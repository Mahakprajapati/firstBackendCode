import jwt from "jsonwebtoken";
import { ApiError } from "../utilities/ErrorHandler.js";
import { User } from "../models/user.models.js";

const verifyJWT = async (req, res, next) => {
  try {
    // console.log("Token", req);

    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "User is not existed");
    }
    //req.variableName
    req.user = user;
    next();
  } catch (error) {
    //NEXT_VIDEO: discus about frontend
    throw new ApiError(401, "Invalid access token");
  }
};

export { verifyJWT };
