export class ApiError extends Error{
    constructor(message, statusCode){
        super(message)
        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : error
        this.isOperational = true // optional
        Error.captureStackTrace(this , this.constructor)
    }
}

export const catchAsync = (fn)=>{
    return (req,res,next)=>{
        fn(req,res,next).catch(next)
    }
}


export const handleJWTError = () =>{
    new ApiError("Invalid Token. please login again" , 401)
}