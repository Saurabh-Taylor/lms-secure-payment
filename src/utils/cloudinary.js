import {v2 as cloudinary} from "cloudinary";

import dotenv from "dotenv";

dotenv.config({})


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

export const uploadMedia = async (file) => {
    try {
        const uploadResponse = await cloudinary.uploader.upload(file,{
            resource_type:"auto"
        })
        return uploadResponse
    } catch (error) {
        console.log("Error while uploading media to cloudinary");
        console.error(error)
    }
}

export const deleteMediaFromCloudinary = async (publicId) => {
    try {
        const deleteResponse = await cloudinary.uploader.destroy(publicId)
    } catch (error) {
        console.log("Failed To delete Media From Cloudinary");
        
        console.error(error);
    }
}


export const deleteVideoFromCloudinary = async (publicId) => {
    try {
        const deleteResponse = await cloudinary.uploader.destroy(publicId , {
            resource_type:"video"
        })
    } catch (error) {
        console.log("Failed To delete Media From Cloudinary");
        
        console.error(error);
    }
}