import {Request,Response,NextFunction } from "express"
import multer from "multer"

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req,file,cb) => {
        let fileName = Date.now() + "-" + file.originalname
        cb(null,fileName)
    }
})

const uploadHandler = (err:any,req:Request,res:Response,next:NextFunction) => {
    if(err instanceof multer.MulterError) {
        if(err.code === "LIMIT_FILE_SIZE") {
            error: "File shume i madh.Max 5MB"
        }
    }
    next()
}


const upload = multer({
    storage,
    fileFilter: (req,file,cb) => {
        let allowed = ["image/jpeg","image/png","application/pdf"]
        if(allowed.includes(file.mimetype)) {
            cb(null,true)
        } else {
            cb(new Error("Ky lloj file nuk lejohet"))
        }
    },
    limits: {
        fieldSize: 5 * 1024 * 1024
    }
})

export default upload