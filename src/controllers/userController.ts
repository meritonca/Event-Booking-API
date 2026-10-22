import {Request,Response,NextFunction} from "express"
import prisma from "../../prisma"
import {asyncHandler} from "../utils/asyncHandler"
import ApiError from "../utils/ApiError"
import bcrypt from "bcryptjs"

export const merrUserat = asyncHandler(async(req:Request,res:Response,next:NextFunction) => {
    const page = req.query.page || 1
    const limit = req.query.limit || 5
    const pageNum = Number(page)
    const limitNum = Number(limit)
    const filter = req.query.filter as string
    const filter2 = req.query.filter2 as string
    const search = req.query.search as string
    const search2 = req.query.search2 as string
    const order = req.query.order as string
    const sort = req.query.sort as string
    const where = {...(search ? {[search]: {contains: search2}} : {}),...(filter ? {[filter]: filter2} : {})}
    const orderBy = order ? {[order]: sort || "asc"} : undefined
    const result = await prisma.user.findMany({where,orderBy,skip: (pageNum - 1) * limitNum,take: limitNum})
    res.status(200).json(result)
})

export const merrUser = asyncHandler(async(req:Request,res:Response,next:NextFunction) => {
    const {id} = req.params
    const result = await prisma.user.findUnique({where: {id: Number(id)}})
    if(!result) {
        throw new ApiError(404,"Nuk u gjend asnje user me kete id")
    }
    res.status(200).json(result)
})

export const krijoUser = asyncHandler(async(req:Request,res:Response,next:NextFunction) => {
    const {name,email,password,role} = req.body
    const passHash = await bcrypt.hash(password, 10)
    const result = await prisma.user.create({data: {name,email,password:passHash,role,}})
    res.status(201).json(result)
})

export const ndryshoUser = asyncHandler(async(req:Request,res:Response,next:NextFunction) => {
    const {id} = req.params
    const {name,email,password,role} = req.body
    const passHash = await bcrypt.hash(password,10)
    const result = await prisma.user.update({where: {id: Number(id)},data: {name,email,password:passHash,role}})
    res.status(200).json(result)
})

export const fshiUser = asyncHandler(async(req:Request,res:Response,next:NextFunction) => {
    const {id} = req.params
    await prisma.user.delete({where: {id: Number(id)}})
    res.status(200).json({message: "U fshi me sukses"})
})

