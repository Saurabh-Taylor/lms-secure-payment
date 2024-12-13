import { ApiError, catchAsync } from "../middleware/error.middleware.js";
import User from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";



export const createUserAccount = catchAsync(async (req, res, next) => {
    const { name , email , password , role='student' } = req.body

    const existingUser = await User.findOne({
        email:email.toLowerCase(),
    })

    if(existingUser){
        throw new ApiError("User already exists", 400)
    }

    const user = await User.create({
        name,
        email:email.toLowerCase(),
        password,
        role
    })

    await user.updateLastActive()
    generateToken(res,user,"Account created successfully")
    
})

export const authenticateUser = catchAsync(async (req, res, next) => {
    const {email , password} = req.body

    const existingUser = User.findOne({email:email.toLowerCase()}).select("+password")
    if(!existingUser){
        throw new ApiError("User not found or check ur email again", 404)
    }
    const isPasswordCorrect = await existingUser.comparePassword(password)
    if(!isPasswordCorrect){
        throw new ApiError("Invalid Password", 401)
    }

    await existingUser.updateLastActive()

    generateToken(res,existingUser,`Welcome Back ${existingUser.name}`)

})

export const signOutUser = catchAsync(async (_, res) => {
    res.cookie("token" , '' , {maxAge:0})
    return res.status(200).json({
        success:true,
        message:"User signed out successfully"
    })
})

export const getCurrentUserProfile = catchAsync(async (req, res, next) => {
    const user = req.user.populate({
        path:"enrolledCourses.course",
        select:"title thumbnail description"
    })

    if(!user){
        throw new ApiError("User not found", 404)
    }

    return res.status(200).json({
        success:true,
        data:{
            ...user.toJSON(),
            totalEnrolledCourses:user.totalEnrolledCourses
        }
    })
})


export const updateUserProfile = catchAsync(async (req, res, next) => {
    const {name , email , bio} = req.body
    const updateData = {
        name, 
        email:email?.toLowerCase(),
        bio
    }

    if(req.file){
        const result = await  uploadMedia(req.file.path)
        updateData.avatar = result.secure_url

        //delete old avatar
        const user = await User.findById(req.user._id)
        if(user.avatar && user.avatar!=="default-avatar.png"){
            await deleteMediaFromCloudinary(user.avatar)
        }
    }

    //update user and get updated user
    const updatedUser = await User.findByIdAndUpdate(req.user._id , updateData , {
        new:true,
        runValidators:true
    })

    if(!updatedUser){
        throw new ApiError("User Cant be updated", 404)
    }

    return res.status(200).json({
        success:true,
        message:"User updated successfully",
        data:updatedUser
    })

})

// export const getCurrentUserProfile = catchAsync(async (req, res, next) => {
//
// })

// export const getCurrentUserProfile = catchAsync(async (req, res, next) => {
//
// })