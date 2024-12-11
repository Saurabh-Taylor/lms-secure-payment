import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true,"Please provide a title"],
        trim:true,
        maxLength:[20,"Title cannot exceed 20 characters"],
    },
    subtitle:{
      type:String,
      trim:true,
      maxLength:[20,"Subtitle cannot exceed 20 characters"],  
    },
    description:{
        type:String,
        required:[true,"Please provide a description"],
        trim:true,
        maxLength:[200,"Description cannot exceed 200 characters"],
    },
    category:{
        type:String,
        required:[true,"Please provide a category"],
        trim:true,
    },
    level:{
        type:String,
        enum:{
            values:["beginner","intermediate","advanced"],
            message:"Please select a valid course level"
        },
        default:"beginner"
    },
    price:{
        type:Number,
        required:[true,"Please provide a price"],
        min:[0 ,"Price cannot be negative"],
    },
    thumbnail:{
        type:String,
        required:[true , "Course thumbnail is required"]
    },

    //User Model
    enrolledStudents:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],

    //lecture model
    lectures:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Lecture"
    }],
    
    // Instructor model
    instructor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:[true, "Instructor is required"]
    },
    isPublished:{
        type:Boolean,
        default:false
    },
    //that timestamps we see in a video
    totalDurations:{
        type:Number,
        default:0
    },
    totalLectures:{
        type:Number,
        default:0
    }
},{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})


courseSchema.virtual("averageRating").get(function(){
    return 0 // placeholder assignment
    // first initial thought we can think of is
    // 1. create a rating field in user Schema
    // 2. create a rating field which is an array
    // 3. then loop through it and calculate the average
})

courseSchema.pre("save", async function(next){

    if(this.lectures.length>0){
        this.totalLectures = this.lectures.length
    }

    next()
})


const Course = mongoose.model("Course", courseSchema)
export default Course