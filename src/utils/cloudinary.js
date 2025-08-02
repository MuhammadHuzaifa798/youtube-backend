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
                resource_type : "auto"
            })

            // .then(result=>console.log(result))

            // .catch(error=>console.error(error));
            
            console.log("file is uploaded on cloudinary ", response.url);

             fs.unlinkSync(localfilepath)
            return response
            
        } catch (error) {
            fs.unlinkSync(localfilepath);
            return null
            
        }
    }
    
    const deleteFromCloudinary = async (url) => {
        try {
    
            let publicId = "";
            if (url) {
            const fileName = url.split("/").pop(); // e.g., "ehdjcnc3zk0swmz0p9xa.png"
            publicId = fileName ? fileName.split(".")[0] : "";
          }
            if (!publicId) {
                throw new Error("Public ID is required for deletion");
            }

            const response = await cloudinary.api.delete_resources(publicId, {
                resource_type: "image"   }
            );
            console.log("File deleted from Cloudinary:", response);
            return response;
        } catch (error) {
            console.error("Error deleting file from Cloudinary:", error);
            return null;
        }
    }


    export {uploadOnCloudinary, deleteFromCloudinary}