import {v2 as cloudinary} from 'cloudinary'

const connectCloudinary = async()=>{
    try {
        cloudinary.config({
            cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
            api_key:process.env.CLOUDINARY_CLOUD_API_KEY,
            api_secret:process.env.CLOUDINARY_CLOUD_API_SECRET,
        })
    } catch (error) {
        throw error
    }
}

export default connectCloudinary
