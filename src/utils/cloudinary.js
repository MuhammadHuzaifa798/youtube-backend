import { v2 as cloudinary } from 'cloudinary'
import { response } from 'express';
import fs from "fs"

 // Configuration
    cloudinary.config({ 
        cloud_name: process.env.cloudinary_cloud_name, 
        api_key: process.env.cloudinary_api_key, 
        api_secret: process.env.cloudinary_api_secret // Click 'View API Keys' above to copy your API secret
    });


    const uploadOnCloudinary = async (localfilepath)=>{
        try {
            if (!localfilepath) return null

            const response = await cloudinary.uploader.upload(localfilepath,{
                resource_type : "auto"
            })
            console.log("file is uploaded on cloudinary ", response.url);
            fs.unlinkSync(localfilepath)
            return response
            
        } catch (error) {
            fs.unlinkSync(localfilepath);
            return null
            
        }
    }
    
    export {uploadOnCloudinary}