import { Request,Response } from "express";
import prisma from "../../prisma";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";


export const merrEventet = asyncHandler(async(req:Request,res:Response) => {
    const filter = req.query.filter as string
    const filter2 = req.query.filter2 as string
    const search = req.query.search as string
    const search2 = req.query.search2 as string
    const order = req.query.order as string
    const sort = req.query.sort as string
    const where = {...(search ? {[search]: {contains: search2}} : {}),...(filter ? {[filter]: filter2}: {}),status: "active"}
    const orderBy = order ? {[order]: sort || "asc"} : undefined 
    const page = req.query.page || 1
    const limit = req.query.limit || 5
    const pageNum = Number(page)
    const limitNum = Number(limit)
    const result = await prisma.event.findMany({where,orderBy,skip: (pageNum - 1)* limitNum,take: limitNum})
    res.status(200).json(result)
})

export const merrEventetEMia = asyncHandler(async(req:Request,res:Response) => {
    const userId = req.user.id
    const filter = req.query.filter as string
    const filter2 = req.query.filter2 as string
    const search = req.query.search as string
    const search2 = req.query.search2 as string
    const order = req.query.order as string
    const sort = req.query.sort as string
    const where = {...(search ? {[search]: {contains: search2}} : {}),...(filter ? {[filter]: filter2}: {}),createdById: userId}
    const orderBy = order ? {[order]: sort || "asc"} : undefined 
    const page = req.query.page || 1
    const limit = req.query.limit || 5
    const pageNum = Number(page)
    const limitNum = Number(limit)
    const result = await prisma.event.findMany({where,orderBy,skip: (pageNum - 1)* limitNum,take: limitNum})
    res.status(200).json(result)
})

export const merrEvent = asyncHandler(async(req:Request,res:Response) => {
    const userId = req.user.id
    const {id} = req.params
    const result = await prisma.event.findFirst({where: {id: Number(id),createdById: userId}})
    if(!result) {
        throw new ApiError(404,"Nuk ka asnje event me kete id")
    }
    res.status(200).json(result)
})

export const krijoEvent = asyncHandler(async(req:Request,res:Response) => {
    const userId = req.user.id
    const {title,description,location,status,date,endDate,price,capacity,image,categoryId} = req.body
    const kategoria = await prisma.category.findFirst({where: {id: categoryId}})
    if(!kategoria) {
        throw new ApiError(404,"Nuk u gjend asnje kategori me kete id")
    }
    if(new Date(endDate) <= new Date()) {
        throw new ApiError(400,"Nuk lejohet qe data e perfundimit te jete ne te kaluaren")
    }
    if(new Date(date) <= new Date()) {
        throw new ApiError(400,"Nuk lejohet qe data e eventit te jete ne te kaluren")
    }
    if(new Date(endDate) <= new Date(date)) {
        throw new ApiError(400,"Nuk lejohet qe endDate te jete ne te kaluaren sesa date e eventit")
    }
    const result = await prisma.event.create({data: {title,description,location,status,date,endDate,price,capacity,image,categoryId,createdById: userId},include: {category: true,user: true}})
    res.status(201).json(result)
})

export const ndryshoEvent = asyncHandler(async(req:Request,res:Response) => {
    const {id} = req.params
    const userId = req.user.id
    const event = await prisma.event.findFirst({where: {id: Number(id),createdById: userId}})
    if(!event) {
        throw new ApiError(404,"Nuk ka asnje event me kete id")
    }
    const ticket = await prisma.ticket.aggregate({where: {status: "sold",eventId: Number(id)},_sum: {quantity: true}})
    const soldCapacity = ticket._sum.quantity ?? 0
    const {title,description,location,status,date,endDate,price,capacity,image,categoryId} = req.body
    const newDatee = date !== undefined ? new Date(date) : event.date;
    const newEndDate = endDate !== undefined ? new Date(endDate) : event.endDate;
     if(new Date(newEndDate) <= new Date()) {
        throw new ApiError(400,"Nuk lejohet qe data e perfundimit te jete ne te kaluaren")
    }
    if(new Date(newDatee) <= new Date()) {
        throw new ApiError(400,"Nuk lejohet qe data e eventit te jete ne te kaluren")
    }
    if(new Date(newEndDate) <= new Date(newDatee)) {
        throw new ApiError(400,"Nuk lejohet qe endDate te jete ne te kaluaren sesa date e eventit")
    }
    if(capacity !== undefined && capacity < soldCapacity) {
        throw new ApiError(400,"Nuk mund te kesh kapacitet me te vogel sesa numri i biletave te shitura")
    }
    
    if(categoryId !== undefined) {
        const kategori = await prisma.category.findFirst({where: {id: categoryId}})
        if(!kategori) {
            throw new ApiError(404,"Nuk u gjend asnje kategori me kete id")
        }
    }
    if(status === "cancelled") {
        await prisma.ticket.updateMany({where: {eventId: Number(id),status: {in: ["pending","sold"]}},data: {status: "cancelled"}})
    }
    const result = await prisma.event.update({where: {id: Number(id)},data: {title,description,location,status,date:newDatee,endDate: newEndDate,price,capacity,image,categoryId,createdById: userId}})
    res.status(200).json(result)
})

export const fshiEvent = asyncHandler(async(req:Request,res:Response) => {
    const {id} = req.params
    const userId = req.user.id
    const event = await prisma.event.findFirst({where: {id: Number(id),createdById: userId}})
    if(!event) {
        throw new ApiError(404,"Nuk ka asnje event me kete id")
    }
    const tiket = await prisma.ticket.aggregate({where: {eventId: Number(id),status: "sold"},_sum: {quantity: true}})
    const shitja = tiket._sum.quantity ?? 0
    if(shitja > 0) {
        await prisma.event.update({where: {id: Number(id)},data: {status: "cancelled"}})
        await prisma.ticket.updateMany({where: {eventId: Number(id),status: {in: ["pending","sold"]}},data: {status: "cancelled"}})
        return
    }
    const pendingTickets = await prisma.ticket.count({where: {eventId: Number(id),status: "pending"}})
    if(pendingTickets > 0) {
        throw new ApiError(409,"Ka rezervime aktive")
    }
    await prisma.event.delete({where: {id: Number(id)}})
    res.status(200).json({message: "U fshi me sukses"})
})

