import { Request,Response } from "express";
import prisma from "../../prisma";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";

export const merrTiketat = asyncHandler(async(req:Request,res:Response) => {
    const page = req.query.page || 1
    const limit = req.query.limit || 5
    const pageNum = Number(page)
    const limitNum = Number(limit)
    const userId = req.user.id
    const filter = req.query.filter as string
    const filter2 = req.query.filter2 as string
    const search = req.query.search as string
    const search2 = req.query.search2 as string
    const order = req.query.order as string
    const sort = req.query.sort as string
    const where = {...(search ? {[search]: {contains: search2}} : {}),...(filter ? {[filter]: filter2} : {}),userId: userId}
    const orderBy = order ? {[order]: sort  || "asc"} : undefined
    const result = await prisma.ticket.findMany({where,orderBy,skip: (pageNum - 1) * limitNum,take: limitNum})
    res.status(200).json(result)
})

export const merrTiket = asyncHandler(async(req:Request,res:Response) => {
    const {id} = req.params
    const userId = req.user.id
    const result = await prisma.ticket.findFirst({where: {id: Number(id),userId: userId}})
    if(!result) {
        throw new ApiError(404,"Nuk u gjend asnje tiket me kete id")
    }
    res.status(200).json(result)
})


export const krijoTiket = asyncHandler(async(req:Request,res:Response) => {
    const userId = req.user.id
    const {eventId,quantity} = req.body
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    if(quantity > 0) {
        const result = await prisma.$transaction(async(tx) => {
            const events = await tx.event.findUnique({where: {id: eventId}})
            if(!events) {
                throw new ApiError(404,"Nuk ka asnje event")
            }
            await tx.$queryRaw `Select * from "Event" where id = ${events.id} FOR UPDATE`;
            const tickets = await tx.ticket.findMany({where: {eventId: eventId, status: {in: ["sold", "pending"]}, OR: [{status: "sold"}, {status: "pending", expiresAt: {gt: new Date()}}]}, select: {quantity: true, cancelledQuantity: true, status: true}})
            const soldticket = tickets.reduce((total, ticket) => {
                if (ticket.status === "sold") {
                    return total + ticket.quantity - ticket.cancelledQuantity
                }
                return total + ticket.quantity
            }, 0)
            const remaningTicket = events.capacity - soldticket
            if(events.date > new Date() && events.endDate > new Date() && events.status !== "cancelled" && remaningTicket >= quantity) {
                let ticket = await tx.ticket.create({data: {eventId,userId,quantity,price: events.price,status: "pending",expiresAt},include: {event: true,user: true}})
                return {ticket}
            } else {
                throw new ApiError(400,"Nuk ka bileta ne dispozicion ose event ka perfunduar apo anuluar")
            }
        })
        res.status(201).json(result)
    } else {
        throw new ApiError(404,"Nuk mund te krijohet ticketa sepse ska kapacitet")
    }
})

export const ndryshoTiket = asyncHandler(async(req:Request,res:Response) => {
    const {id} = req.params
    const userId = req.user.id
    const {quantity,status} = req.body
    if (quantity !== undefined && status === "cancelled") {
        throw new ApiError(400, "Nuk mund te ndryshosh sasine dhe anulosh bileten ne te njejten kerkese")
    }
    const ticket = await prisma.ticket.findFirst({where: {id: Number(id),userId: userId}})
    if(!ticket) {
        throw new ApiError(404,"Nuk u gjend asnje tiket me kete userId")
    }
    if(ticket.status !== "pending" && ticket.status !== "sold") {
        throw new ApiError(400,"S lejohet ndryshim sepse tashme bileta eshte anuluar")
    }
    if (ticket.status === "pending" && ticket.expiresAt !== null && ticket.expiresAt <= new Date()) {
        throw new ApiError(400, "Rezervimi ka skaduar dhe nuk mund te ndryshohet")
    }
    const event = await prisma.event.findFirst({where: {id: ticket.eventId}})
    if(!event) {
        throw new ApiError(404,"Nuk u gjend asnje event me kete id")
    }
    if (event.status === "cancelled") {
        throw new ApiError(400, "Nuk mund te ndryshohet bileta sepse eventi eshte anuluar")
    }
    if (ticket.status === "pending" && event.date <= new Date()) {
        throw new ApiError(400,"Rezervimi nuk mund te ndryshohet pasi eventi ka filluar")
    }
    if (event.endDate <= new Date()) {
        throw new ApiError(400, "Nuk mund te ndryshohet bileta sepse eventi ka perfunduar")
    }

    let result1 
    let result2
    if(quantity !== undefined || status === "cancelled") {
        if(quantity !== undefined) {
            if (!Number.isInteger(quantity) || quantity <= 0) {
                throw new ApiError(400, "Sasia duhet te jete numer i plote pozitiv")
            }
            if (quantity < ticket.cancelledQuantity) {
                throw new ApiError(400, "Sasia nuk mund te jete me e vogel se biletat e anuluara")
            }
            if (ticket.status !== "pending") {
                throw new ApiError(400,"Sasia mund te ndryshohet vetem per rezervimet pending")
            }
            const llogaritjeETicket = await prisma.ticket.findMany({where: {eventId: ticket.eventId,id: {not: Number(id)},status: {in: ["pending","sold"]}},select: {quantity: true,cancelledQuantity: true,status: true}})
            const sasia = llogaritjeETicket.reduce((total,tiket) => {
                if(tiket.status === "sold") {
                    return total + tiket.quantity - tiket.cancelledQuantity
                }
                return total + tiket.quantity
            },0)
            const gjithsej = event.capacity - sasia
            if(gjithsej >= quantity) {
                result1 = await prisma.ticket.update({where: {id: Number(id)},data: {quantity}}) 
            } else {
                throw new ApiError(400,"Nuk ka bileta aktive per momentin")
            }
        }
        if(status === "cancelled") {
            result2 = await prisma.ticket.update({where: {id: Number(id)},data: {status: "cancelled", cancelledQuantity: ticket.quantity}})
        }
        res.status(200).json({result1,result2})
    } else {
        throw new ApiError(400,"Quantity nuk eshte derguar ose statusi i biletes seshte cancelled")
    }
})

export const fshiTiket = asyncHandler(async(req:Request,res:Response) => {
    const {id} = req.params
    const userId = req.user.id
    const ticket = await prisma.ticket.findFirst({where: {id: Number(id)},select: {userId: true,quantity: true,status: true,eventId: true,expiresAt: true,cancelledQuantity:true}})
    if(!ticket) {
        throw new ApiError(404,"Nuk u gjend asnje ticket me kete userId")
    }
    if(ticket.userId !== userId && req.user.role !== "admin") {
        throw new ApiError(403,"Nuk keni leje per te bere ndryshime")
    }
    if(ticket.status !== "pending" && ticket.status !== "sold") {
        throw new ApiError(400,"Nuk lejohet ndryhsimi i ticket pasi qe tani eshte cancelled")
    }
    if(ticket.status === "pending" && ticket.expiresAt !== null && ticket.expiresAt <= new Date()) {
        throw new ApiError(400,"Afati per rezervim ka perfundaur")
    }
    const events = await prisma.event.findFirst({where: {id: ticket.eventId}})
    if(!events) {
        throw new ApiError(404,"Nuk u gjend asnje event")
    }
    if(events.status === "cancelled") {
        throw new ApiError(400,"Nuk mund te rezervohet nje bilete sepse event eshte anuluar")
    }
    if (events.date <= new Date()) {
        throw new ApiError(400, "Nuk mund te anulohet bileta pasi eventi ka filluar")
    }
    if(events.endDate <= new Date()) {
        throw new ApiError(400,"Nuk mund te rezervohet bilete sepse event ka mbaruar")
    }
    const order = await prisma.order.findUnique({
        where: { ticketId: Number(id) }
    })
    if (order && order.status !== "cancelled") {
        await prisma.order.update({where: { id: order.id },data: { status: "cancelled" }})
    }

    await prisma.ticket.update({where: {id: Number(id)},data: {status: "cancelled",cancelledQuantity:ticket.quantity}})
    res.status(200).json({message: "U fshi me sukses"})
})

