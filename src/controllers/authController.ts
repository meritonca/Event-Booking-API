import { Request,Response } from "express";
import prisma from "../../prisma";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"


export const Register = asyncHandler(async(req:Request,res:Response) => {
    const {name,email,password} = req.body
    const ekziston = await prisma.user.findUnique({where: {email: email}})
    if(ekziston) {
        throw new ApiError(400,"Email ekziston")
    }
    let passHash = await bcrypt.hash(password,10)

    let user = await prisma.user.create({data: {name,email,password: passHash,role: "user"},select: {name: true,email: true,role:true}})
    res.status(201).json(user)
})

export const Login = asyncHandler(async(req:Request,res:Response) => {
    const {email,password} = req.body
    const user = await prisma.user.findUnique({where: {email: email}})
    if(!user) {
        throw new ApiError(400,"Email ose password gabim")
    }
    let krahaso = await bcrypt.compare(password,user.password)
    if(!krahaso) {
        throw new ApiError(400,"Email ose password gabim")
    }
    let token = jwt.sign(
        {id: user.id,name: user.name,email:user.email,role: user.role},
        process.env.JWT_SECRET as string,
        {expiresIn: "7 days"}
    )
    res.status(200).json({
        message: "U bere login",
        token: token
    })
})