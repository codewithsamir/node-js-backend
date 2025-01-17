import mongoose,{Schema} from 'mongoose'
import jwt from 'jsonwebtoken'  //jsonwebtoken
import bcrypt from 'bcrypt'   //for security of password 


const userSchema =new Schema({
username:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,
    index:true,
},
email:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,
    
},
fullname:{
    type:String,
    required:true,
    trim:true,
    index:true,
},
avatar:{
    type:String, // cloudinary url
    required:true,
    
},
coverimage:{
    type:String, // cloudinary url
    
    
},
watchHistory:[
    {
        type:Schema.Types.ObjectId,
        ref:"Video"
    }
],
password:{
    type:String,
    required:[true,"Password is required"]
},
refreshToken:{
    type:String
}


},{timestamps:true})

//use normal function because it have this keyword access
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
   return jwt.sign({
        _id:this.id,
        email:this.email,
        username:this.username,
        fullname:this.fullname
    },
String(process.env.ACCESS_TOKEN_SECRET),
{
    expiresIn:String(process.env.ACCESS_TOKEN_EXPIRE)
}
)
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id:this.id,
     
    },
String(process.env.REFRESH_TOKEN_SECRET),
{
    expiresIn:String(process.env.REFRESH_TOKEN_EXPIRE)
}
)
}

export const User = mongoose.model("User",userSchema)