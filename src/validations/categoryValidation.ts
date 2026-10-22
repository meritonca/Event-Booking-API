import Joi from "joi"


export const createCategoryValidation = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    description: Joi.string().min(5).max(500).required()
})

export const updateCategoryValidation = Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    description: Joi.string().min(5).max(50).optional()
})

