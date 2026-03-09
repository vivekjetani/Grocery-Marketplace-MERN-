import express from "express";
import {
  checkAuth,
  sellerLogin,
  sellerLogout,
  getUsersForSeller,
  getUserDetailsForSeller,
  deleteUserForSeller,
} from "../controller/seller.controller.js";
import { authSeller } from "../middlewares/authSeller.js";
const router = express.Router();

router.post("/login", sellerLogin);
router.get("/is-auth", authSeller, checkAuth);
router.get("/logout", authSeller, sellerLogout);
router.get("/users", authSeller, getUsersForSeller);
router.get("/users/:id", authSeller, getUserDetailsForSeller);
router.delete("/users/:id", authSeller, deleteUserForSeller);

export default router;
