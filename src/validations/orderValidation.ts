import Joi from "joi"


export const createOrderValidation = Joi.object({
    eventId: Joi.number().integer().min(1).required(),
    quantity: Joi.number().integer().min(1).required(),
})

