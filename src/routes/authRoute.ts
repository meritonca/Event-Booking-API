import { Router } from "express";
import {validate} from "../middleware/validate"


import {
    Register,
    Login
} from "../controllers/authController"

import {
    registerValidation,
    loginValidation
} from "../validations/authValidation"

const authRoutes = Router()

authRoutes.post("/register",validate(registerValidation),Register)
authRoutes.post("/login",validate(loginValidation),Login)

export default authRoutes