import express from "express";
import {
    captainLogin,
    captainLogout,
    checkCaptainAuth,
    getCaptainOrders,
    respondToOrder,
    confirmDelivery,
} from "../controller/captain.controller.js";
import { authCaptain } from "../middlewares/authCaptain.js";

const router = express.Router();

router.post("/login", captainLogin);
router.get("/is-auth", authCaptain, checkCaptainAuth);
router.get("/logout", authCaptain, captainLogout);
router.get("/orders", authCaptain, getCaptainOrders);
router.post("/respond/:id", authCaptain, respondToOrder);
router.post("/confirm/:id", authCaptain, confirmDelivery);

export default router;
