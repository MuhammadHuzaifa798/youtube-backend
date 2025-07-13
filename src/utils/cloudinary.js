import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"

 // Configuration
    cloudinary.config({ 
        cloud_name: process.env.cloudinary_cloud_name, 
        api_key: process.env.cloudinary_api_key, 
        api_secret: process.env.cloudinary_api_secret
         // Click 'View API Keys' above to copy your API secret
    });


    const uploadOnCloudinary = async (localfilepath) => {
        try {
            if (!localfilepath){
                // throw new Error("Local file path is required for upload");

                console.error("Local file path is required for upload");
                
                return null;
            } 

            const response = await cloudinary.uploader.upload(localfilepath,{
                // folder : "upload",
                resource_type : "auto"
            })

            // .then(result=>console.log(result))

            // .catch(error=>console.error(error));
            
            console.log("file is uploaded on cloudinary ", response.url);

            // fs.unlinkSync(localfilepath)
            return response
            
        } catch (error) {
            fs.unlinkSync(localfilepath);
            return null
            
        }
    }
    
    export {uploadOnCloudinary}