import Joi from "joi";


export const createTicketValidation =  Joi.object({
    eventId: Joi.number().integer().required(),
    userId: Joi.number().integer().required(),
    quantity: Joi.number().integer().min(1).required(),
    price: Joi.number().integer().min(0).required(),
    status: Joi.string().valid("pending","confirmed","cancelled").required()
})

export const updateTicketValidation = Joi.object({
    eventId: Joi.number().integer().optional(),
    userId: Joi.number().integer().optional(),
    quantity: Joi.number().integer().min(1).optional(),
    price: Joi.number().integer().min(0).optional(),
    status: Joi.string().valid("pending","confirmed","cancelled").optional()
}).or("quantity","status")