    import Joi from "joi"


export const createEventValidation = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(1000).required(),
    location: Joi.string().min(2).max(200).required(),
    date: Joi.date().required(),
    price: Joi.number().integer().min(0).required(),
    capacity: Joi.number().integer().min(1).required(),
    image: Joi.string().required(),
    categoryId: Joi.number().integer().required(),
    createdById: Joi.number().integer().required()
})

export const updateEventValidation = Joi.object({
    title: Joi.string().min(3).max(100).optional(),
    description: Joi.string().min(10).max(1000).optional(),
    location: Joi.string().min(2).max(200).optional(),
    date: Joi.date().optional(),
    price: Joi.number().integer().min(0).optional(),
    capacity: Joi.number().integer().min(1).optional(),
    image: Joi.string().optional(),
    categoryId: Joi.number().integer().optional(),
    createdById: Joi.number().integer().optional()
})