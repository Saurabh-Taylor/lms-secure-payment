import express from "express";
import { createUserAccount , authenticateUser , getCurrentUserProfile , signOutUser, updateUserProfile } from "../controllers/user.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import upload from "../utils/multer.js";
import { validateSignup } from "../middleware/validation.middleware.js";

const router = express.Router()

//register-login
router.post("/register", validateSignup , createUserAccount)
router.post("/login", authenticateUser)

//profile routes
router
    .route("/profile")
    .get(isAuthenticated , getCurrentUserProfile)
    .patch(isAuthenticated , upload.single("avatar") , updateUserProfile)

//logout
router.get("/logout", isAuthenticated , signOutUser)


export default router