import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'


    // Configuration
    cloudinary.config({ 
        cloud_name: String(process.env.CLOUDINARY_NAME), 
        api_key: String(process.env.CLOUDINARY_API_KEY), 
        api_secret:String(process.env.CLOUDINARY_API_SECRET) // Click 'View API Keys' above to copy your API secret
    });
    
    // Upload an image


const uploadonCloudinary = async (localfilepath)=>{
    
    try {
        if(!localfilepath) return null;

       const response = await cloudinary.uploader.upload(localfilepath ,{
            resource_type:"auto"
        })
        //file has been uploded successfully
        // console.log("file is uploaded on cloudinary",response.url);
        fs.unlinkSync(localfilepath)
        return response;
        
    } catch (error) {
        fs.unlinkSync(localfilepath) // remove the locally saved temporary file as the upload operation got failed
     
        return null;
    }
}



   export {uploadonCloudinary } 