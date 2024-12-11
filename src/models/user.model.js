import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { type } from "os";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please provide a name"],
        trim:true,
        maxLength:[20,"Name cannot exceed 20 characters"],
        minLength:[3,"Name should have more than 3 characters"]
    },
    email:{
        type:String,
        required:[true,"Please provide a email"],
        trim:true,
        maxLength:[20,"Email cannot exceed 20 characters"],
        minLength:[3,"Email should have more than 3 characters"],
        unique:true,
        lowercase:true,
        match: [
            /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
            "Please provide a valid email",
        ]
    },
    password:{
        type:String,
        required:[true,"Please provide a password"],
        minLength:[8,"Password should have more than 8 characters"],
        select:false
    },
    role:{
        type:String,
        enum:{
            values:["admin","student", "instructor"],
            message:"Role is either: admin, student or instructor"
        },
        default:"student"
    },
    avatar:{
        type:String,
        default:"default-avatar.png"
    },
    bio:{
        type:String,
        maxLength:[200, "Bio cannot exceed 200 characters"],
    },
    enrolledCourses:[{
            course:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Course",
            },
            enrolledAt:{
                type:Date,
                default:Date.now
            }
    }],
    createdCourses:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course"
    }],
    resetPasswordToken: String,
    resetPasswordExpire:Date,
    lastActive:{
        type:Date,
        default:Date.now
    }
},{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})


//hashing  password
userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next()
    }
    this.password = await bcrypt.hash(this.password , 10)
    next()
})


//compare password
userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password , this.password)
}
// generating reset password token
userSchema.methods.getResetPasswordToken = function(){
    const resetToken=crypto.randomBytes(20).toString('hex')
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000 // 10 minutes
    return resetToken
}

// method to check when user was last active
userSchema.methods.updateLastActive = function(){
    this.lastActive = Date.now()
    return this.lastActive({ validateBeforeSave : false })
}




// virtual field for total enrolled courses
userSchema.virtual("totalEnrolledCourses").get(function(){
    return this.enrolledCourses.length
})

const User = mongoose.model("User", userSchema);
export default User


/*
Validate before save. And this needs to be false. Why false why? We want to turn off the validation.

Because this is actually updating your document and is trying to save it every single time the document is going to be saved.

All of your, uh, constraints like minimum length and all of these, like lowercase, all of them will be active.

And if that email is not being passed on in that particular request, it's going to throw the error.

So anytime you are doing that intentionally that, hey, I want to save this, I know what I'm doing.

I have updated just one field. Just go ahead and update that.

So that's why we are saying that, hey, just turn off all the validation momentarily only and just go ahead and save this one.
*/
