import { Router } from "express";
import {validate} from "../middleware/validate"
import {auth} from "../middleware/auth"
import {authorize} from "../middleware/authorize"

import {
    merrKategorite,
    merrKategori,
    krijoKategori,
    ndryshoKategori,
    fshiKategori
} from "../controllers/categoryController"

import {
    createCategoryValidation,
    updateCategoryValidation
} from "../validations/categoryValidation"

import {
    paginationValidation
} from "../validations/paginationValidation"

import {
    categoryQueryValidation
} from "../validations/queryValidation"

const categoryRoute = Router()

categoryRoute.get("/",validate(paginationValidation, "query"),validate(categoryQueryValidation,"query"),merrKategorite)
categoryRoute.get("/:id",merrKategori)
categoryRoute.post("/",auth,authorize("admin"),validate(createCategoryValidation),krijoKategori)
categoryRoute.put("/:id",auth,authorize("admin"),validate(updateCategoryValidation),ndryshoKategori)
categoryRoute.delete("/:id",auth,authorize("admin"),fshiKategori)

export default categoryRoute