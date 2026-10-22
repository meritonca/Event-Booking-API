import {Request, Response} from 'express';
import prisma from '../../prisma';
import { asyncHandler } from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';


export const merrOrders = asyncHandler(async(req:Request,res:Response) => {
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
    const orderBy = order ? {[order]: sort || "asc"} : undefined
    const result = await prisma.order.findMany({where,orderBy,skip: (pageNum - 1) * limitNum,take: limitNum})
    res.status(200).json(result)
})

export const merrOrder = asyncHandler(async(req:Request,res:Response) => {
    const {id} = req.params
    const userId = req.user.id
    const result = await prisma.order.findFirst({where: {id: Number(id),userId: userId}})
    if(!result) {
        throw new ApiError(404,"Nuk u gjend asnje order me kete id")
    }
    res.status(200).json(result)
})

export const krijoOrder = asyncHandler(async(req:Request,res:Response) => {
    const userId = req.user.id
    const {eventId,quantity} = req.body

    const event = await prisma.event.findUnique({where: {id: eventId},select: {id: true,price: true,capacity: true,date: true,status: true}})
    if(!event) {
        throw new ApiError(404,"Nuk u gjend asnje event")
    }
    if(event.status === "cancelled") {
        throw new ApiError(400, "Nuk mund te blesh bileta sepse eventi eshte anuluar")
    }
    const now = new Date()
    const gjithsej = event.price * quantity
    if(now < event.date) {
        const result = await prisma.$transaction(async(tx) => {
            await tx.$queryRaw`SELECT id FROM "Event" WHERE id = ${eventId} FOR UPDATE`
            const now = new Date()
            if(now > event.date) {
                throw new ApiError(400,"Event ka filluar")
            }
            if(event.status === "cancelled") {
                throw new ApiError(400, "Nuk mund te blesh bileta sepse eventi eshte anuluar")
            }
            const bilet = await tx.ticket.aggregate({where: {eventId: eventId,status: "sold"},_sum: {quantity: true}})
            const biletatEAnuluara = await tx.ticket.aggregate({where: {eventId: eventId,status: "cancelled"},_sum: {quantity: true}})
            const shtijeEBiletav = bilet._sum.quantity || 0
            const anulimiTicket = biletatEAnuluara._sum.quantity || 0
            const remaning = quantity - anulimiTicket
            const remaing = event.capacity - shtijeEBiletav 
            if(remaing >= quantity) {
                const ticket = await tx.ticket.create({data: {eventId,userId,quantity,price: event.price,status: "sold"},include: {event: true,user:true}})
                const order = await tx.order.create({data: {ticketId: ticket.id,userId,totalPrice: gjithsej}})
                return {order,ticket}
            } else {
                throw new ApiError(404,"Nuk ka bileta te mjaftueshme")
            }
        })
        res.status(201).json(result)
    } else {
        throw new ApiError(404,"Nuk ka bileta te mjaftueshme ose eventi ka filluar")
    }
})

export const ndryshoOrder = asyncHandler(async(req:Request,res:Response) => {
    const {id} = req.params
    const userId = req.user.id
    const {quantity} = req.body

    const orders = await prisma.order.findFirst({where: {id: Number(id),userId: userId}})
    if(!orders) {
        throw new ApiError(404,"Nuk u gjend asnje order me kete userId")
    }
    const ticket = await prisma.ticket.findFirst({where: {id: orders.ticketId,userId: userId},select: {id: true,status: true,quantity: true,cancelledQuantity: true,event: {select: {date: true}}}})
    if(!ticket) {
        throw new ApiError(404,"Nuk u gjend asnje ticket per kete userId")
    } 
    const now = new Date()
    const remaning = ticket.quantity - ticket.cancelledQuantity

    if(ticket.status === "sold" && now < ticket.event.date) {
        if (quantity <= 0 || quantity > remaning) {
            throw new ApiError(400, "Numri i biletave per anulim nuk eshte valid")
        }
        let result = await prisma.$transaction(async(tx) => {
            const cancelled = ticket.cancelledQuantity + quantity
            let ticketa = await tx.ticket.update({where: {id: ticket.id},data: {cancelledQuantity: cancelled, status: cancelled === ticket.quantity ? "cancelled" : "sold"}})

            let ordera = orders
            if(cancelled === ticket.quantity) {
                ordera = await tx.order.update({where: {id: Number(id)},data: {status: "cancelled"}})
            }

            return {ticketa,ordera}
        })
        res.status(200).json(result)
    } else {
        throw new ApiError(400,"Nuk lejohet anulimi: bileta nuk eshte aktive ose eventi ka filluar")
    }
})

export const fshiOrder = asyncHandler(async(req:Request,res:Response) => {
    const {id} = req.params
    const userId = req.user.id
    const orders = await prisma.order.findFirst({where: {id: Number(id),userId: userId}})
    if(!orders) {
        throw new ApiError(404,"Nuk u gjend asnje order me kete userId")
    }
    if(orders.status !== "cancelled") {
        throw new ApiError(400,"Nuk lejohet fshirja e order sepse eshte ende aktive")
    }
    const ticket = await prisma.ticket.findFirst({where: {id: orders.ticketId}})
    if(!ticket) {
        throw new ApiError(404,"Nuk u gjend asnje tikete")
    }
    if(ticket.status === "sold") {
        throw new ApiError(400,"Nuk lejohet fshirja e order")
    }
    await prisma.order.delete({where: {id: Number(id)}})
    res.status(200).json({message: "U fshi me sukses"})
})
