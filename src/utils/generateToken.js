import jwt from "jsonwebtoken";

const cookieOptions = {
    httpOnly:true, 
    sameSite:"strict", 
    maxAge:24*60*60*1000
}

export const generateToken = (res,user,message)=> {
    const token = jwt.sign({userId:user._id}, process.env.JWT_SECRET , {
        expiresIn:"1d"
    })
    return res
        .status(200)
        .cookie("token",token , cookieOptions)
        .json({
        success:true,
        message,
        token,
        user
    })
}

// we can place token expiry time in constants