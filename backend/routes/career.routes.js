import express from "express";
import { upload } from "../config/multer.js";
import { authSeller } from "../middlewares/authSeller.js";
import {
    createCareer,
    updateCareer,
    deleteCareer,
    getAdminCareers,
    getCareerApplications,
    updateApplicationStatus,
    getActiveCareers,
    getCareerById,
    applyForCareer
} from "../controller/career.controller.js";

const router = express.Router();

// --------------------------
// Admin Routes (Seller Auth)
// --------------------------
router.post("/create", authSeller, upload.fields([{ name: "banner", maxCount: 1 }]), createCareer);
router.put("/update/:id", authSeller, upload.fields([{ name: "banner", maxCount: 1 }]), updateCareer);
router.delete("/delete/:id", authSeller, deleteCareer);
router.get("/admin/list", authSeller, getAdminCareers);
router.get("/applications", authSeller, getCareerApplications);
router.put("/applications/:id", authSeller, updateApplicationStatus);

// --------------------------
// Client Routes 
// --------------------------
router.get("/active", getActiveCareers);
router.get("/:id", getCareerById);
router.post("/apply/:id", upload.fields([{ name: "resume", maxCount: 1 }]), applyForCareer);

export default router;
