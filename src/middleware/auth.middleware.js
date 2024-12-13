import jwt from "jsonwebtoken";
import { ApiError, catchAsync } from "./error.middleware.js";
import User from "../models/user.model.js";

export const isAuthenticated = catchAsync( async (req, res, next) => {
  const token = req.cookies.token

  if(!token){
    throw new ApiError("You are not logged in", 401)
  }

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET)   
    req.user = await User.findById(decoded.userId)
    next()
  } catch (error) {
    throw new ApiError("Invalid Token. please login again", 401)
  }

})