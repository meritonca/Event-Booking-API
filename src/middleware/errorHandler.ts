import { Request,Response,NextFunction } from "express";
import ApiError from "../utils/ApiError";

export const errorHandler = (err:any,req:Request,res:Response,next:NextFunction) => {
    if(err instanceof ApiError) {
        return res.status(err.statusCode).json({error: err.message})
    }
    console.log(err)
    res.status(500).json({error: "Serveri ka probleme"})
}
