import { Router } from "express";
import {validate} from "../middleware/validate"
import { auth } from "../middleware/auth";
import { authorize } from "../middleware/authorize";

import {
    merrEventet,
    merrEventetEMia,
    merrEvent,
    krijoEvent,
    ndryshoEvent,
    fshiEvent
} from "../controllers/eventController"

import {
    createEventValidation,
    updateEventValidation
} from "../validations/eventValidation"

import {
    paginationValidation
} from "../validations/paginationValidation"

import {
    eventQueryValidation
} from "../validations/queryValidation"

const eventRoute = Router()

eventRoute.get("/events",auth,validate(paginationValidation, "query"),validate(eventQueryValidation,"query"),merrEventet)
eventRoute.get("/",auth,validate(paginationValidation, "query"),validate(eventQueryValidation,"query"),merrEventetEMia)
eventRoute.get("/:id",auth,merrEvent)
eventRoute.post("/",auth,authorize("admin"),validate(createEventValidation),krijoEvent)
eventRoute.put("/:id",auth,authorize("admin"),validate(updateEventValidation),ndryshoEvent)
eventRoute.delete("/:id",auth,authorize("admin"),fshiEvent)

export default eventRoute