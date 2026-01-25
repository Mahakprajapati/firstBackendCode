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
    //upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      folder: "mythings/",
      resource_type: "auto",
      created_at: `${date.toLocaleTimeString}`,
    });
    //file has been uploaded successfully
    // console.log("response :", response);
    // console.log("File is Uploaded on Cloudinary Successfully", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove the locally saved temporary file as the upload operation got failed.
    return null;
  }
};

const deleteFromCloudinary = async function (
  publicId,
  resource_type = "image"
) {
  try {
    if (!publicId) return null;
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: `${resource_type}`,
    });

    return result;
  } catch (error) {
    console.log(`Delete from cloudinary is failed : ${error}`);
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
