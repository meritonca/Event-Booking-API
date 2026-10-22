import { Request,Response } from "express";
import prisma from "../../prisma";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import {Prisma}  from "@prisma/client";

export const merrReviews = asyncHandler(async(req:Request,res:Response) => {
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
    const result = await prisma.review.findMany({where,orderBy,skip: (pageNum - 1) * limitNum,take: limitNum})
    res.status(200).json(result)
})

export const merrReview = asyncHandler(async(req:Request,res:Response) => {
    const {id} = req.params
    const userId = req.user.id
    const result = await prisma.review.findFirst({where: {id: Number(id),userId: userId}})
    if(!result) {
        throw new ApiError(404,"Nuk u gjend asnje review me kete id")
    }
    res.status(200).json(result)
})

export const krijoReview = asyncHandler(async(req:Request,res:Response) => {
    const userId = req.user.id
    const {rating,comment,eventId} = req.body
    const findEvent = await prisma.event.findFirst({where: {id: eventId}})
    if(!findEvent) {
        throw new ApiError(404,"Nuk ka asnje event")
    }
    if (findEvent.status === "cancelled") {
        throw new ApiError(400,"Nuk lejohet krijimi i review sepse event eshte anuluar")
    }
    if (findEvent.endDate >= new Date()) {
        throw new ApiError(400, "Event nuk ka perfunduar ende")
    }
    const existingTicket = await prisma.ticket.findMany({where: {userId,eventId,status: "sold"},select: {userId: true,eventId: true,quantity: true,cancelledQuantity: true}})
    if(existingTicket.length === 0) {
        throw new ApiError(404,"Nuk ekziston asnje bilete")
    }
    const activeTicket = existingTicket.reduce((totali,ticket) => totali += ticket.quantity - ticket.cancelledQuantity,0) 
    if(activeTicket <= 0) {
        throw new ApiError(400,"Nuk ka bileta aktive")
    }
    const existingReview = await prisma.review.findFirst({where: {userId,eventId}})
    if(existingReview) {
        throw new ApiError(400,"Nuk mund te beni nje review te dyte")
    }
    try {
        const beReview = await prisma.review.create({data: {rating,comment,userId,eventId},include: {user: true,event: true}})
        res.status(201).json(beReview)
    } catch(error) {
        if(error instanceof  Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new ApiError(409,"Nuk mund te beni nje rewiew te dyte")
        }
        throw error
    }
})

export const ndryshoReview = asyncHandler(async(req:Request,res:Response) => {
    const {id} = req.params
    const userId = req.user.id
    const review = await prisma.review.findFirst({where: {id: Number(id),userId: userId},select: {event: {select: {status: true}}}})
    if (!review) {
        throw new ApiError(404, "Nuk u gjend asnje review me kete id") 
    }
    if(review.event.status === "cancelled") {
        throw new ApiError(400,"Nuk lejohet ndryshimi i review sepse event eshte anuluar")
    }
    const {rating,comment} = req.body
    const result = await prisma.review.update({where: {id: Number(id)},data: {...(rating !== undefined && {rating}),...(comment !== undefined && {comment})}})
    res.status(200).json(result)
})

export const fshiReview = asyncHandler(async(req:Request,res:Response) => {
    const {id} = req.params
    const userId = req.user.id
    const review = await prisma.review.findFirst({where: {id: Number(id),userId: userId}})
    if(!review) {
        throw new ApiError(404,"Nuk ka asnje review me kete userId")
    }
    await prisma.review.delete({where: {id: Number(id)}})
    res.status(200).json({message: "U fshi me sukses"})
})

