import Joi from "joi"

export const createUserValidation = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid("user","admin").required()
})

export const updateUserValidation = Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid("user","admin").optional()
})