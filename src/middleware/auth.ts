import { Request,Response,NextFunction } from "express";
import jwt from "jsonwebtoken"
import ApiError from "../utils/ApiError";

declare global {
    namespace Express {
        interface Request {
            user: any
        }
    }
}


export function auth(req:Request,res:Response,next:NextFunction) {
    let token = req.headers.authorization as string
    if(!token) {
       return next(new ApiError(403,"Nuk gjendet"))
    }
    if(token.startsWith("Bearer ")) {
        token = token.slice(7)
    }
    try {
        let encoded = jwt.verify(token,process.env.JWT_SECRET as string)
        req.user = encoded
        next()
    } catch(err) {
        return next(new ApiError(401,"Token i pavleshem"))
    }
}