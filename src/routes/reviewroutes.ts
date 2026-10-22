import { Router } from "express";
import {validate} from "../middleware/validate"
import { auth } from "../middleware/auth";
import { authorize } from "../middleware/authorize";

import {
    merrReviews,
    merrReview,
    krijoReview,
    ndryshoReview,
    fshiReview
} from "../controllers/reviewController"

import {
    createReviewValidation,
    updateReviewValidation
} from "../validations/reviewValidation"

import {
    paginationValidation
} from "../validations/paginationValidation"

import {
    reviewQueryValidation
} from "../validations/queryValidation"

const reviewRoute = Router()

reviewRoute.get("/",auth,validate(paginationValidation, "query"),validate(reviewQueryValidation,"query"),merrReviews)
reviewRoute.get("/:id",auth,merrReview)
reviewRoute.post("/",auth,authorize("user"),validate(createReviewValidation),krijoReview)
reviewRoute.put("/:id",auth,authorize("user"),validate(updateReviewValidation),ndryshoReview)
reviewRoute.delete("/:id",auth,authorize("user"),fshiReview)

export default reviewRoute