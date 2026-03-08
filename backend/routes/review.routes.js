import express from "express";
import { addReview, getProductReviews, canReviewProduct } from "../controller/review.controller.js";
import authUser from "../middlewares/authUser.js";

const router = express.Router();

router.post("/add", authUser, addReview);
router.get("/list", getProductReviews);
router.get("/can-review", authUser, canReviewProduct);

export default router;
