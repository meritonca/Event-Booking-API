import { Request,Response,NextFunction } from "express";
import prisma from "../../prisma";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import {Prisma} from "@prisma/client"

export const merrKategorite = asyncHandler(async(req:Request,res:Response,next:NextFunction) => {
    const allowedSearch = ["name","description"]
    const filter = req.query.filter as string
    if(filter === undefined && !allowedSearch.includes(filter)) {
        throw new ApiError(400,"Filtrimi qe po beni s lejohet")
    }
    const filter2 = req.query.filter2 as string
    const search = req.query.search as string
    if(search === undefined && !allowedSearch.includes(search)) {
        throw new ApiError(400,"Kerkimin qe po beni nuk lejohet")
    }
    const search2 = req.query.search2 as string
    const order = req.query.order as string
    if(order !== undefined && !allowedSearch.includes(order)) {
        throw new ApiError(400,"Order qe po ben s lejohet")
    }
    const sort = req.query.sort as string
    const where = {...(search ? {[search]: {contains: search2}}: {}),...(filter ? {[filter]: filter2} : {})}
    const orderBy = order ? {[order]: sort || "asc"} : undefined
    const page = req.query.page || 1
    const limit = req.query.limit || 5
    const pageNum = Number(page)
    const limitNum = Number(limit)
    const result = await prisma.category.findMany({where,orderBy,skip: (pageNum - 1) * limitNum,take: limitNum})
    res.status(200).json(result)
})

export const merrKategori = asyncHandler(async(req:Request,res:Response,next: NextFunction) => {
    const {id} = req.params
    const result = await prisma.category.findUnique({where: {id: Number(id)}})
    if(!result) {
        throw new ApiError(404,"Nuk u gjet ndonje kategori me kete id")
    }
    res.status(200).json(result)
})

export const krijoKategori = asyncHandler(async(req:Request,res:Response,next:NextFunction) => {
    const {name,description} = req.body
    try {
        const result = await prisma.category.create({data: {name,description}})
        res.status(201).json(result)
    } catch(error) {
        if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new ApiError(400,"Kjo kategori ekziston tashme")
        }
        throw error
    }
})

export const ndryshoKategori = asyncHandler(async(req:Request,res:Response) => {
    const {name,description} = req.body
    try {
        const {id} = req.params
        const result = await prisma.category.update({where: {id: Number(id)},data: {name,description}})
        res.status(200).json(result)
    } catch(error) {
        if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new ApiError(409,"Kjo kategori nuk mund te ndryshohet ne kategori qe ekziston")
        }
        throw error
    }
})

export const fshiKategori = asyncHandler(async(req:Request,res:Response) => {
    const {id} = req.params
    const categori = await prisma.category.findFirst({where: {id: Number(id)},include: {events: true}})
    if(!categori) {
        throw new ApiError(404,"Nuk u gjend")
    }
    if(categori.events.length > 0) {
        throw new ApiError(409,"Nuk mund te fshish sepse ka evente")
    }
    await prisma.category.delete({where: {id: Number(id)}})
    res.status(200).json({message: "U fshi me sukses"})
})
