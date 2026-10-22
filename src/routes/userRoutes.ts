import { Router } from "express"
import {validate} from "../middleware/validate"
import { auth } from "../middleware/auth"
import { authorize } from "../middleware/authorize"

import {
    merrUserat,
    merrUser,
    krijoUser,
    ndryshoUser,
    fshiUser
} from "../controllers/userController"

import {
    createUserValidation,
    updateUserValidation
} from "../validations/userValidation"

import {
    paginationValidation
} from "../validations/paginationValidation"

import {
    userQueryValidation
} from "../validations/queryValidation"

const userRouter = Router()

userRouter.get("/",auth,authorize("admin"),validate(paginationValidation,"query"),validate(userQueryValidation,"query"),merrUserat)
userRouter.get("/:id",auth,authorize("admin"),merrUser)
userRouter.post("/",auth,authorize("admin"),validate(createUserValidation),krijoUser)
userRouter.put("/:id",auth,authorize("admin"),validate(updateUserValidation),ndryshoUser)
userRouter.delete("/:id",auth,authorize("admin"),fshiUser)

export default userRouter