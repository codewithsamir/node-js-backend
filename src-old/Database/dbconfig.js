
import mongoose from 'mongoose'
import {DB_NAME} from '../constant.js'

const connectdatabase =async ()=>{

    try {
        const connection = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        // console.log(`\n MONGODB CONNECTED !! DB HOST : ${connection}`);
        console.log(`\n MONGODB CONNECTED !! DB HOST : ${connection.connection.host}`);
        
    } catch (error) {
        console.log(`MONGODB connection error ${error}`);
        process.exit(1)
        
    }
}

export default connectdatabase;















