import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true,"Please provide a lecture title"],
        trim:true,
        maxLength:[20,"Lecture Title cannot exceed 20 characters"],
    },
    description:{
        type:String,
        required:[true,"Please provide a description"],
        trim:true,
        maxLength:[200,"Description cannot exceed 200 characters"],
    },
    video:{
        type:String,
        required:[true , "Video is required"]
    },
    duration:{
        type:Number,
        default:0
    },

    // for the deletion or anything else
    publicId:{
        type:String,
        required:[true , "Public Id is required"]
    },

    //is Preview field is for the single video we want to show in the course
    isPreview:{
        type:Boolean,
        default:false
    },
    // sequence of the lectures
    order:{
        type:Number,
        required:[true, "Lecture Order is Required"]
    }
},{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})  

lectureSchema.pre("save", function (next) {
    
    if(this.duration){
        this.duration = Math.round(this.duration * 100)/100
    }

    next()
})

const Lecture = mongoose.model("Lecture", lectureSchema)
export default Lecture