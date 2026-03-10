import express from "express";
import { addReview, getProductReviews, canReviewProduct, addEmailReview, checkEmailReview } from "../controller/review.controller.js";
import authUser from "../middlewares/authUser.js";

const router = express.Router();

router.post("/add", authUser, addReview);
router.post("/email-review", addEmailReview);    // no auth — uses signed token
router.get("/email-check", checkEmailReview);    // no auth — check if already reviewed
router.get("/list", getProductReviews);
router.get("/can-review", authUser, canReviewProduct);

export default router;
