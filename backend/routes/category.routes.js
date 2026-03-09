import express from "express";
import { addCategory, getCategories, updateCategory, deleteCategory } from "../controller/category.controller.js";
import { authSeller } from "../middlewares/authSeller.js";
import { upload } from "../config/multer.js";

const router = express.Router();

router.get("/list", getCategories);
router.post("/add", authSeller, upload.single("image"), addCategory);
router.put("/update/:id", authSeller, updateCategory);
router.delete("/delete/:id", authSeller, deleteCategory);

export default router;
