import express from "express";

import { authSeller } from "../middlewares/authSeller.js";
import {
  addProduct,
  changeStock,
  getBestSellers,
  getProductAnalytics,
  getProductById,
  getProducts,
  getRecommendedProducts,
  deleteProduct,
  deleteProductsByCategory,
  transferProducts
} from "../controller/product.controller.js";
import { upload } from "../config/multer.js";
const router = express.Router();

router.post("/add-product", authSeller, upload.array("image"), addProduct);
router.get("/list", getProducts);
router.get("/id", getProductById);
router.post("/stock", authSeller, changeStock);
router.get("/best-sellers", getBestSellers);
router.get("/recommended", getRecommendedProducts);
router.get("/analytics/:id", authSeller, getProductAnalytics);

// Category Product Management Routes
router.delete("/delete/:id", authSeller, deleteProduct);
router.delete("/delete-by-category", authSeller, deleteProductsByCategory);
router.put("/transfer", authSeller, transferProducts);

export default router;
