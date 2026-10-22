import Joi from "joi";


export const categoryQueryValidation = Joi.object({
    search: Joi.string().valid("name","description").optional(),
    search2: Joi.string().optional(),

    filter: Joi.string().valid("name","description").optional(),
    filter2: Joi.string().optional(),

    order: Joi.string().valid("name","description").optional(),
    sort: Joi.string().valid("asc","desc").optional()
})


export const eventQueryValidation = Joi.object({
    search: Joi.string().valid("title","description","location","date","price","capacity","image","categoryId").optional(),
    search2: Joi.string().optional(),

    filter: Joi.string().valid("title","description","location","date","price","capacity","image","categoryId").optional(),
    filter2: Joi.string().optional(),

    order: Joi.string().valid("title","description","location","date","price","capacity","image","categoryId").optional(),
    sort: Joi.string().valid("asc","desc").optional()
})

export const orderQueryValidation = Joi.object({
    search: Joi.string().valid("totalPrice","status").optional(),
    search2: Joi.string().optional(),

    filter: Joi.string().valid("totalPrice","status").optional(),
    filter2: Joi.string().optional(),

    order: Joi.string().valid("totalPrice","status").optional(),
    sort: Joi.string().valid("asc","desc").optional()
})

export const  reviewQueryValidation = Joi.object({
    search: Joi.string().valid("rating","comment","eventId").optional(),
    search2: Joi.string().optional(),

    filter: Joi.string().valid("rating","comment","eventId").optional(),
    filter2: Joi.string().optional(),

    order: Joi.string().valid("rating","comment","eventId").optional(),
    sort: Joi.string().valid("asc","desc").optional()
})

export const ticketQueryValidation = Joi.object({
    search: Joi.string().valid("eventId","quantity","price","status").optional(),
    search2: Joi.string().optional(),

    filter: Joi.string().valid("eventId","quantity","price","status").optional(),
    filter2: Joi.string().optional(),

    order: Joi.string().valid("eventId","quantity","price","status").optional(),
    sort: Joi.string().valid("asc","desc").optional()
})

export const userQueryValidation = Joi.object({
    search: Joi.string().valid("name","email","password","role").optional(),
    search2: Joi.string().optional(),

    filter: Joi.string().valid("name","email","password","role").optional(),
    filter2: Joi.string().optional(),

    order: Joi.string().valid("name","email","password","role").optional(),
    sort: Joi.string().valid("asc","desc").optional()
})
