// require('dotenv').config({path:'./env'})
import dotenv from 'dotenv'
import mongoose from "mongoose";
import connectdatabase from "./Database/dbconfig.js";

dotenv.config({
    path:"./env"
})

connectdatabase()










// import express from 'express'

// const app = express()


// // const databaseConnect =
// ;(
//     async ()=>{
//         try {
//            await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//            app.on('error',(error)=>{
//             console.log(`Errors : ${error}`)
//             throw error
//            })
//            app.listen(process.env.PORT, ()=>{
//             console.log(`App os listning on port ${process.env.PORT}`);
            
//            })
//         } catch (error) {
//             console.log("Error:", error)
//             throw error
//         }
//     }
// )()