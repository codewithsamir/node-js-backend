
import mongoose from 'mongoose'

const databaseConnect = async ()=>{
    try {
       await mongoose.connect(process.env.MONGODB_URL)
    } catch (error) {
        console.log("Error:", error)
        throw error
    }
}