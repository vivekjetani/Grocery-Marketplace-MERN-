import express from "express";
import { applyCoupon, createCoupon, getCouponsForSeller, deleteCoupon, getCouponUsageDetails, toggleCouponStatus } from "../controller/coupon.controller.js";
import authUser from "../middlewares/authUser.js";

const router = express.Router();

router.post("/apply", authUser, applyCoupon);
router.post("/create", createCoupon);
router.get("/list", getCouponsForSeller);
router.delete("/:id", deleteCoupon);
router.patch("/toggle/:id", toggleCouponStatus);
router.get("/usage/:id", getCouponUsageDetails);

export default router;
