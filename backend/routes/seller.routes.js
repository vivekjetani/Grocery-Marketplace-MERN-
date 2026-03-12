import express from "express";
import {
  checkAuth,
  sellerLogin,
  sellerLogout,
  getUsersForSeller,
  getUserDetailsForSeller,
  deleteUserForSeller,
  getSmtpSettings,
  updateSmtpSettings,
  testSmtpConnection,
  createCaptain,
  getAllCaptains,
  deleteCaptain,
  // Dashboard analytics
  getDashboardOverview,
  getSalesChartData,
  getCategoryDistribution,
  getProductTrends,
  getRecentActivity,
  sendLowStockAlert,
  // Store Info
  getStoreInfo,
  updateStoreInfo,
  // Inquiries
  submitInquiry,
  getInquiries,
  deleteInquiry,
  // Bulk Upload
  bulkUploadProducts,
  getBulkUploadTemplate,
} from "../controller/seller.controller.js";
import { authSeller } from "../middlewares/authSeller.js";
import { memoryUpload } from "../config/multer.js"; // Ensure this import is correct
const router = express.Router();

router.post("/login", sellerLogin);
router.get("/is-auth", authSeller, checkAuth);
router.get("/logout", authSeller, sellerLogout);
router.get("/users", authSeller, getUsersForSeller);
router.get("/users/:id", authSeller, getUserDetailsForSeller);
router.delete("/users/:id", authSeller, deleteUserForSeller);
router.get("/smtp", authSeller, getSmtpSettings);
router.put("/smtp", authSeller, updateSmtpSettings);
router.post("/smtp/test", authSeller, testSmtpConnection);
// Captain management
router.post("/captain", authSeller, createCaptain);
router.get("/captains", authSeller, getAllCaptains);
router.delete("/captain/:id", authSeller, deleteCaptain);
// Dashboard analytics
router.get("/dashboard/overview", authSeller, getDashboardOverview);
router.get("/dashboard/sales-chart", authSeller, getSalesChartData);
router.get("/dashboard/category-distribution", authSeller, getCategoryDistribution);
router.get("/dashboard/product-trends", authSeller, getProductTrends);
router.get("/dashboard/recent-activity", authSeller, getRecentActivity);
router.post("/dashboard/low-stock-alert", authSeller, sendLowStockAlert);
// Store Info (public read, protected write)
router.get("/store-info", getStoreInfo);
router.put("/store-info", authSeller, updateStoreInfo);
// Inquiries (public submit, protected manage)
router.post("/inquiry", submitInquiry);
router.get("/inquiries", authSeller, getInquiries);
router.delete("/inquiry/:id", authSeller, deleteInquiry);

// Bulk upload
router.post("/bulk-upload", authSeller, memoryUpload.single("file"), bulkUploadProducts);
router.get("/bulk-upload-template", authSeller, getBulkUploadTemplate);

export default router;
