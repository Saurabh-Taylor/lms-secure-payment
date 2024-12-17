import Razorpay from "razorpay";
import Course from "../models/course.model";
import { CoursePurchase } from "../models/coursePurchase.model";
import { ApiError, catchAsync } from "../middleware/error.middleware";
import crypto from "crypto";


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
});

export const createOrder = catchAsync(async (req, res) => {
    const userId = req.user._id
    const { courseId } = req.body

    const course = await Course.findById(courseId)
    if (!course) {
        throw new ApiError("Course not found", 404)
    }

    const newPurchase = new CoursePurchase({
        user: userId,
        course: courseId,
        amount: course.price,
        status: "pending",
    })

    const options = {
        amount: course.price * 100, // amount in paise
        currency: "INR",
        receipt: `course-${courseId}`,
        notes:{
            courseId:courseId,
            userId:userId
        }
    }

    const order = await razorpay.orders.create(options)
    newPurchase.paymentId = order.id
    await newPurchase.save()

    return res.status(200).json({
        success: true,
        data: order,
        course:{
            name:course.title,
            description:course.description
        }
    })

})

export const verifyPayment = catchAsync(async (req, res) => {
    const { razorpay_order_id , razorpay_payment_id , razorpay_signature } = req.body

    const body  = razorpay_order_id + "|" + razorpay_payment_id

    const expectedSignature = crypto
    .createHmac("sha256" , process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex")

    const isAuthentic = expectedSignature === razorpay_signature

    const purchase = await CoursePurchase.findOne({
        paymentId:razorpay_order_id
    })

    if(!purchase){
        return res.status(400).json({
            success:false,
            message:"Payment verification failed"
        })
    }
    purchase.status = "completed"
    await purchase.save()
    return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        courseId: purchase.course
    })

})
