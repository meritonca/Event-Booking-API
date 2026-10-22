import Joi from "joi"


export const createReviewValidation = Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().min(2).max(500).required(),
    eventId: Joi.number().integer().positive().required()
})

export const updateReviewValidation = Joi.object({
    rating: Joi.number().integer().min(1).max(5).optional(),
    comment: Joi.string().min(2).max(500).optional(),
}).or("rating","comment")