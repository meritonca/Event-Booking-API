import { Request,Response,NextFunction } from "express"
import Joi from "joi"


export function validate(schema: Joi.ObjectSchema,source: "query" | "body" = "body") {
    return(req:Request,res:Response,next:NextFunction) => {
        let data = source === "query" ? req.query : req.body
        let {error} = schema.validate(data)
        if(error) {
            return res.status(400).json({error: error.details[0].message})
        }
        next()
    }
}