// require('dotenv').config({path:'./env'})
import dotenv from 'dotenv'
import mongoose from "mongoose";
import connectdatabase from "./Database/dbconfig.js";
import { app } from './app.js';

dotenv.config({
    path:"./env"
})

connectdatabase()
.then(()=>{


    app.on('error',(error)=>{
                    console.log(`Errors : ${error}`)
                    throw error
                   })
    app.listen(process.env.PORT || 8000 , ()=>{
        console.log(`server is started at http://localhost:${process.env.PORT}`);

        
        
    })
})
.catch((error)=>{
    console.log(`Mongodb connection faild !! ${error}`)
})









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