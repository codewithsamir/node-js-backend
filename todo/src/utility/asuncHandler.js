const asyncHandler = (requesthandler)=>{
    (req,res,next)=>{
        Promise.resolve(requesthandler(req,res,next)).catch((err)=>next(err))
    }
}



export {asyncHandler}

// const asyncHandler = (fn)=> async (rea,res,next)=>{

//     try {
//         await fn(req,res,next)
//     } catch (err) {
//         res.status(err.code || 500).json({success:false,
//             message: err.message
//         })
//     }

// }