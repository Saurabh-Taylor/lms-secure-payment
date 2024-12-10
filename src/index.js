import express from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongooseSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000


//Global Rate Limit
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    message:"Too Many Requests from this IP , please try again"
}) 

//secruity middleware
app.use(helmet())
app.use(mongooseSanitize())
app.use(hpp())
app.use("/api",limiter) 

//loggin middleware
if(process.env.NODE_ENV === "development"){
    app.use(morgan("dev"))
}

//body parser middleware
app.use(express.json({limit:"10kb"}))
app.use(express.urlencoded({extended:true,limit:"10kb"}))
app.use(cookieParser())

//CORS Configuration
app.use(cors({
    origin:  process.env.CLIENT_URL || "http://localhost:3000",
    credentials:true,
    methods:["GET", "POST" , "PUT" , "PATCH" , "DELETE" ,"HEAD" , "OPTIONS" ],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "device-remember-token",
        "Access-Control-Allow-Origin",
        "Origin",
        "Accept",
    ]
}));

//Global Error Handler
app.use((err,req,res,next)=>{
    console.error(err.stack);
    res.status(err.status || 500).json({
        status:"error",
        message:err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && {stack:err.stack})
    })
})



//API ROUTES

// it should be always at bottom
// 404 handler
app.use((req,res)=>{
    res.status(404).json({
        status:"error",
        message:"Page not found"
    })
})

app.listen(PORT, () => console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`));