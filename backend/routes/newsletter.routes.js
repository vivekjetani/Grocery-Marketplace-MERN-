import express from "express";
import {
    subscribe,
    unsubscribe,
    getSubscribers,
    removeSubscriber,
    sendNewsletter,
    uploadImage,
} from "../controller/newsletter.controller.js";
import { authSeller } from "../middlewares/authSeller.js";
import { upload } from "../config/multer.js";

const router = express.Router();

// Public routes for subscribe / unsubscribe
router.post("/subscribe", subscribe);
router.post("/unsubscribe", unsubscribe);

// Protected routes (Admin/Seller)
router.get("/subscribers", authSeller, getSubscribers);
router.post("/send", authSeller, sendNewsletter);
router.post("/upload-image", authSeller, upload.single("image"), uploadImage);
router.delete("/subscribers/:id", authSeller, removeSubscriber);

export default router;
