import { Router } from "express";
import {validate} from "../middleware/validate"
import { auth} from "../middleware/auth";
import { authorize } from "../middleware/authorize";

import {
    merrTiketat,
    merrTiket,
    krijoTiket,
    ndryshoTiket,
    fshiTiket
} from "../controllers/ticketController"

import {
    createTicketValidation,
    updateTicketValidation
} from "../validations/ticketValidation"

import {
    paginationValidation
} from "../validations/paginationValidation"

import {
    ticketQueryValidation
} from "../validations/queryValidation"

const ticketRoute = Router()

ticketRoute.get("/",auth,validate(paginationValidation, "query"),validate(ticketQueryValidation,"query"),merrTiketat)
ticketRoute.get("/:id",auth,merrTiket)
ticketRoute.post("/",auth,authorize("user"),validate(createTicketValidation),krijoTiket)
ticketRoute.put("/:id",auth,authorize("user"),validate(updateTicketValidation),ndryshoTiket)
ticketRoute.delete("/:id",auth,authorize("user"),fshiTiket)

export default ticketRoute