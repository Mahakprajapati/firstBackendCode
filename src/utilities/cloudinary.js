import { v2 as cloudinary } from "cloudinary";
import { response } from "express";
import fs from "fs";
const date = new Date();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async function (localFilePath) {
  try {
    if (!localFilePath) return null;
    await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      type: "upload",
      created_at: `${date.toLocaleTimeString}`,
    });
    //file has been uploaded successfully
    console.log("File is Uploaded on Cloudinary Successfully", response.url);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove the locally saved temporary file as the upload operation got failed.
    return null;
  }
};

export { uploadOnCloudinary };
