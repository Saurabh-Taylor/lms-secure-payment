import mongoose from "mongoose";

const lectureProgressSchema = new mongoose.Schema({
    // this field is which lecture we are tracking
    lecture:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Lecture",
        required:[true , "Lecture Reference is required"]
    },
    isCompleted:{
        type:Boolean,
        default:false
    },
    watchTime:{
        type:Number,
        default:0
    },
    lastWatchedAt:{
        type:Date,
        default:Date.now
    }
})


const courseProgressSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:[true , "User Reference is required"]
    },
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
        required:[true , "Course Reference is required"]
    },
    isCompleted:{
        type:Boolean,
        default:false
    },
    completionPercentage:{
        type:Number,
        default:0,
        min:0,
        max:0
    },

    lecturesProgress:[lectureProgressSchema],
    // ! VERY IMPORTANT
    lastAccessed:{
        type:Date,
        default:Date.now
    }
},{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

// calculate completion percentage
courseProgressSchema.pre("save", function (next) {
    if(this.lecturesProgress.length>0){
         const completedLectures = this.lecturesProgress.filter(lp=>lp.isCompleted).length
         this.completionPercentage = Math.round( (completedLectures/this.lecturesProgress.length) * 100 )
         this.isCompleted = this.completionPercentage === 100
    }
    next()
})


//update last accessed 
courseProgressSchema.methods.updateLastAccessed = function(){
    this.lastAccessed = Date.now()
    return this.save({ validateBeforeSave : false })
}

export const CourseProgress = mongoose.model("CourseProgress", courseProgressSchema)

