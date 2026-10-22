import { Router } from "express";
import {validate} from "../middleware/validate"
import { auth} from "../middleware/auth";
import { authorize } from "../middleware/authorize";

import {
    merrOrders,
    merrOrder,
    krijoOrder,
    ndryshoOrder,
    fshiOrder
} from "../controllers/orderController"

import {
    createOrderValidation
} from "../validations/orderValidation"

import {
    paginationValidation
} from "../validations/paginationValidation"

import {
    orderQueryValidation
} from "../validations/queryValidation"

const orderRoute = Router()

orderRoute.get("/",auth,validate(paginationValidation, "query"),validate(orderQueryValidation,"query"),merrOrders)
orderRoute.get("/:id",auth,merrOrder)
orderRoute.post("/",auth,authorize("admin"),validate(createOrderValidation),krijoOrder)
orderRoute.put("/:id",auth,authorize("admin"),ndryshoOrder)
orderRoute.delete("/:id",auth,authorize("admin"),fshiOrder)

export default orderRoute