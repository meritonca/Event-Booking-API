import Joi from "joi"

export const paginationValidation = Joi.object({
    page: Joi.number().integer().min(1).max(10).optional(),
    limit: Joi.number().integer().min(1).max(100).optional()
})