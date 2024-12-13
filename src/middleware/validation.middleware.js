import { body , param , query , validationResult } from "express-validator";


export const validate = (validations)=>{
    return async (req,res,next) => {
        
        await Promise.all(validations.map(validationResult.run(req)))

        const errors = validationResult(req)
        if(errors.isEmpty()){
            return next()
        }

        const extractedError = errors.array().map(err=> ({
            field:err.path,
            message:err.msg
        }))

        throw new Error(extractedError)

    }
}


export const commonValidation = {
    paginatin:[
        query("page")
            .optional()
            .isInt({min:1})
            .withMessage("Page must be a positive integer"),
        query("limit")
            .isInt({min:1})
            .optional()
            .withMessage("Limit must between 1 and 100")    
    ],
    email:
        body("email")
            .isEmail()
            .normalizeEmail()
            .withMessage("Please enter a valid email"),
    name:
        body("name")
            .trim()
            .isLength({min:2 , max:50})
            .withMessage("Please enter a name"),
}


export const validateSignup =  validate([
    commonValidation.email,
    commonValidation.name,
])