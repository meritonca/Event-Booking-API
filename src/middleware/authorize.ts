import { Request,Response,NextFunction } from "express";
import ApiError from "../utils/ApiError";

export function authorize(rolet: string) {
    return(req:Request,res:Response,next:NextFunction) => {
        if(!req.user || !rolet.includes(req.user.role)) {
            return next(new ApiError(401,"Sjeni i autorizuar"))
        }
        next()
    }
}
