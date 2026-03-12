import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Review from "../models/review.model.js";
import Address from "../models/address.model.js";
import Smtp from "../models/smtp.model.js";
import Captain from "../models/captain.model.js";
import Product from "../models/product.model.js";
import StoreInfo from "../models/storeInfo.model.js";
import Inquiry from "../models/inquiry.model.js";
import { sendTestEmail, sendCaptainWelcomeEmail, sendLowStockAlertEmail, sendContactInquiryEmail, sendUserContactConfirmationEmail } from "../services/email.service.js";
import mongoose from "mongoose";
// seller login :/api/seller/login
export const sellerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      password === process.env.SELLER_PASSWORD &&
      email === process.env.SELLER_EMAIL
    ) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      res.cookie("sellerToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return res
        .status(200)
        .json({ message: "Login successful", success: true });
    } else {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }
  } catch (error) {
    console.error("Error in sellerLogin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// check seller auth  : /api/seller/is-auth
export const checkAuth = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Error in checkAuth:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// logout seller: /api/seller/logout
export const sellerLogout = async (req, res) => {
  try {
    res.clearCookie("sellerToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict",
    });
    return res.status(200).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// get all users for seller leaderboard: /api/seller/users
export const getUsersForSeller = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "userId",
          as: "orders"
        }
      },
      {
        $lookup: {
          from: "reviews",
          localField: "userIdString",
          foreignField: "userId",
          as: "reviews"
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          orderCount: { $size: "$orders" },
          reviewCount: { $size: "$reviews" },
          totalSpent: { $sum: "$orders.amount" },
          isVerified: 1,
          createdAt: 1
        }
      },
      {
        $sort: { orderCount: -1, reviewCount: -1 }
      }
    ]);

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error in getUsersForSeller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// get user details for seller: /api/seller/users/:id
export const getUserDetailsForSeller = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID", success: false });
    }

    const user = await User.findById(id).select("-password -cartItems");
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    const orders = await Order.find({ userId: id }).sort({ createdAt: -1 });
    const reviews = await Review.find({ userId: id }).populate("productId", "name image").sort({ createdAt: -1 });

    const totalSpent = orders.reduce((sum, order) => sum + order.amount, 0);

    res.status(200).json({
      success: true,
      user,
      orders,
      reviews,
      totalSpent,
      orderCount: orders.length,
      reviewCount: reviews.length
    });
  } catch (error) {
    console.error("Error in getUserDetailsForSeller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// delete a user: /api/seller/users/:id
export const deleteUserForSeller = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID", success: false });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    // Delete related user data
    await Address.deleteMany({ userId: id });
    await Review.deleteMany({ userId: id });

    // We intentionally leave Order documents intact to preserve financial history.
    // Removing the user itself.
    await User.findByIdAndDelete(id);

    res.status(200).json({ message: "User deleted successfully", success: true });
  } catch (error) {
    console.error("Error in deleteUserForSeller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// get SMTP settings: /api/seller/smtp
export const getSmtpSettings = async (req, res) => {
  try {
    const smtp = await Smtp.findOne();
    res.status(200).json({ success: true, smtp });
  } catch (error) {
    console.error("Error in getSmtpSettings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// update SMTP settings: /api/seller/smtp
export const updateSmtpSettings = async (req, res) => {
  try {
    const { host, port, user, password, admins, fromEmail, isEnabled, isLowStockAlertEnabled } = req.body;
    let smtp = await Smtp.findOne();
    if (smtp) {
      smtp.host = host;
      smtp.port = port;
      smtp.user = user;
      if (password) {
        smtp.password = password;
      }
      smtp.admins = admins;
      smtp.fromEmail = fromEmail;
      smtp.isEnabled = isEnabled;
      smtp.isLowStockAlertEnabled = isLowStockAlertEnabled;
      await smtp.save();
    } else {
      smtp = await Smtp.create({ host, port, user, password, admins, fromEmail, isEnabled, isLowStockAlertEnabled });
    }
    res.status(200).json({ message: "SMTP settings updated", success: true, smtp });
  } catch (error) {
    console.error("Error in updateSmtpSettings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// test SMTP settings: /api/seller/smtp/test
export const testSmtpConnection = async (req, res) => {
  try {
    const { toEmail } = req.body;
    if (!toEmail) {
      return res.status(400).json({ message: "toEmail is required", success: false });
    }
    const result = await sendTestEmail(toEmail);
    res.status(200).json({ message: "Test email sent successfully", success: true, result });
  } catch (error) {
    console.error("Error in testSmtpConnection:", error);
    res.status(500).json({ message: "Failed to send test email. Check your SMTP settings.", error: error.message, success: false });
  }
};

// ==== CAPTAIN MANAGEMENT ====

// Create Captain: POST /api/seller/captain
export const createCaptain = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required", success: false });
    }

    const existing = await Captain.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "A captain with this email already exists", success: false });
    }

    // Use provided password or auto-generate a random one
    const plainPassword = password || Math.random().toString(36).slice(-8) + "@Cpt1";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const captain = await Captain.create({ name, email, password: hashedPassword });

    // Send welcome email with credentials (async)
    (async () => {
      try {
        await sendCaptainWelcomeEmail(captain, plainPassword);
      } catch (emailError) {
        console.error("Failed to send captain welcome email:", emailError);
      }
    })();

    res.status(201).json({
      message: "Captain created and welcome email sent",
      success: true,
      captain: { _id: captain._id, name: captain.name, email: captain.email, isActive: captain.isActive, isBusy: captain.isBusy },
    });
  } catch (error) {
    console.error("Error in createCaptain:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get All Captains: GET /api/seller/captains
export const getAllCaptains = async (req, res) => {
  try {
    const captains = await Captain.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, captains });
  } catch (error) {
    console.error("Error in getAllCaptains:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete Captain: DELETE /api/seller/captain/:id
export const deleteCaptain = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid captain ID", success: false });
    }
    const captain = await Captain.findByIdAndDelete(id);
    if (!captain) {
      return res.status(404).json({ message: "Captain not found", success: false });
    }
    res.status(200).json({ message: "Captain deleted successfully", success: true });
  } catch (error) {
    console.error("Error in deleteCaptain:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// =====================================================
// DASHBOARD ANALYTICS APIs
// =====================================================

// GET /api/seller/dashboard/overview
export const getDashboardOverview = async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, revenueAgg, statusAgg] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments({ $or: [{ paymentType: "COD" }, { isPaid: true }] }),
      Order.aggregate([
        { $match: { $or: [{ paymentType: "COD" }, { isPaid: true }] } },
        { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
      ]),
      Order.aggregate([
        { $match: { $or: [{ paymentType: "COD" }, { isPaid: true }] } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
    const statusMap = {};
    statusAgg.forEach(s => { statusMap[s._id] = s.count; });

    // Low stock products (qty <= 5)
    const lowStockProducts = await Product.find({ stockQuantity: { $lte: 5 }, inStock: true }).select("name stockQuantity category");

    res.status(200).json({
      success: true,
      overview: {
        totalRevenue,
        totalOrders,
        totalUsers,
        totalProducts,
        statusBreakdown: statusMap,
        lowStockCount: lowStockProducts.length,
        lowStockProducts,
      }
    });
  } catch (error) {
    console.error("Error in getDashboardOverview:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/seller/dashboard/sales-chart
export const getSalesChartData = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
      createdAt: { $gte: startDate },
    }).select("amount createdAt status");

    // Build day-by-day buckets
    const buckets = {};
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().split("T")[0];
      buckets[key] = { date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), revenue: 0, orders: 0 };
    }

    orders.forEach(order => {
      const key = new Date(order.createdAt).toISOString().split("T")[0];
      if (buckets[key] && order.status !== "Cancelled") {
        buckets[key].revenue += order.amount;
        buckets[key].orders += 1;
      }
    });

    res.status(200).json({ success: true, chartData: Object.values(buckets) });
  } catch (error) {
    console.error("Error in getSalesChartData:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/seller/dashboard/category-distribution
export const getCategoryDistribution = async (req, res) => {
  try {
    const data = await Product.aggregate([
      { $group: { _id: "$category", productCount: { $sum: 1 }, totalOrders: { $sum: "$orderCount" } } },
      { $sort: { totalOrders: -1 } },
      { $project: { name: "$_id", productCount: 1, totalOrders: 1, _id: 0 } }
    ]);
    res.status(200).json({ success: true, categories: data });
  } catch (error) {
    console.error("Error in getCategoryDistribution:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/seller/dashboard/product-trends
export const getProductTrends = async (req, res) => {
  try {
    const products = await Product.find({})
      .sort({ orderCount: -1 })
      .limit(10)
      .select("name category orderCount offerPrice price stockQuantity inStock averageRating numReviews image");

    const trending = products.map(p => ({
      _id: p._id,
      name: p.name,
      category: p.category,
      orderCount: p.orderCount,
      revenue: p.orderCount * p.offerPrice,
      offerPrice: p.offerPrice,
      price: p.price,
      stockQuantity: p.stockQuantity,
      inStock: p.inStock,
      averageRating: p.averageRating,
      numReviews: p.numReviews,
      image: p.image?.[0],
    }));

    res.status(200).json({ success: true, products: trending });
  } catch (error) {
    console.error("Error in getProductTrends:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/seller/dashboard/recent-activity
export const getRecentActivity = async (req, res) => {
  try {
    const orders = await Order.find({ $or: [{ paymentType: "COD" }, { isPaid: true }] })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("items.product", "name image category")
      .lean();

    // Enrich with user names
    const userIds = [...new Set(orders.map(o => o.userId))];
    const users = await User.find({ _id: { $in: userIds } }).select("name email").lean();
    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u; });

    const enriched = orders.map(order => ({
      _id: order._id,
      userId: order.userId,
      userName: userMap[order.userId]?.name || "Unknown",
      userEmail: userMap[order.userId]?.email || "",
      amount: order.amount,
      status: order.status,
      paymentType: order.paymentType,
      itemCount: order.items?.length || 0,
      createdAt: order.createdAt,
    }));

    res.status(200).json({ success: true, activities: enriched });
  } catch (error) {
    console.error("Error in getRecentActivity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/seller/dashboard/low-stock-alert
export const sendLowStockAlert = async (req, res) => {
  try {
    const threshold = parseInt(req.body.threshold) || 5;
    const lowStockProducts = await Product.find({ stockQuantity: { $lte: threshold } })
      .select("name stockQuantity category");

    if (lowStockProducts.length === 0) {
      return res.status(200).json({ success: true, message: "No low-stock products found.", count: 0 });
    }

    const smtp = await Smtp.findOne();
    if (!smtp || !smtp.isEnabled || smtp.isLowStockAlertEnabled === false) {
      return res.status(400).json({ success: false, message: "SMTP or Low-Stock alerts are disabled globally." });
    }

    // Only send to admins who are enabled AND have lowStock notifications on
    const sellerEmail = process.env.SELLER_EMAIL?.toLowerCase().trim();
    const adminEmails = (smtp.admins || [])
      .filter(a => {
          if (!a.isEnabled) return false;
          const aEmail = a.email?.toLowerCase().trim();
          if (sellerEmail && aEmail === sellerEmail) return false;
          return a.notifications?.lowStock === true;
      })
      .map(a => a.email);

    if (adminEmails.length === 0) {
      return res.status(400).json({ success: false, message: "No admin recipients have low-stock alerts enabled. Check SMTP → Admin Recipients settings." });
    }

    await sendLowStockAlertEmail(lowStockProducts, adminEmails);

    res.status(200).json({
      success: true,
      message: `Low-stock alert sent to ${adminEmails.length} admin(s) for ${lowStockProducts.length} product(s).`,
      count: lowStockProducts.length,
    });
  } catch (error) {
    console.error("Error in sendLowStockAlert:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/seller/store-info  (public – no auth needed)
export const getStoreInfo = async (req, res) => {
  try {
    let info = await StoreInfo.findOne();
    if (!info) info = await StoreInfo.create({});
    res.status(200).json({ success: true, storeInfo: info });
  } catch (error) {
    console.error("Error in getStoreInfo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PUT /api/seller/store-info  (protected)
export const updateStoreInfo = async (req, res) => {
  try {
    const { address, phone, whatsapp, email, openHours, closedDays, mapLink, cancellationPolicy, safetyPolicy } = req.body;
    let info = await StoreInfo.findOne();
    if (info) {
      Object.assign(info, { address, phone, whatsapp, email, openHours, closedDays, mapLink, cancellationPolicy, safetyPolicy });
      await info.save();
    } else {
      info = await StoreInfo.create({ address, phone, whatsapp, email, openHours, closedDays, mapLink, cancellationPolicy, safetyPolicy });
    }
    res.status(200).json({ success: true, message: "Store info updated", storeInfo: info });
  } catch (error) {
    console.error("Error in updateStoreInfo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/seller/inquiry (public)
export const submitInquiry = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required", success: false });
    }

    const inquiry = await Inquiry.create({ name, email, message });

    // Background notifications
    (async () => {
      try {
        // 1. Send confirmation to user
        await sendUserContactConfirmationEmail(email, name);

        // 2. Notify enabled admins
        const smtp = await Smtp.findOne();
        if (smtp && smtp.isEnabled) {
          const adminEmails = (smtp.admins || [])
            .filter(a => a.isEnabled && a.notifications?.contactInquiry !== false)
            .map(a => a.email);

          if (adminEmails.length > 0) {
            await sendContactInquiryEmail(inquiry, adminEmails);
          }
        }
      } catch (err) {
        console.error("Inquiry notification error:", err);
      }
    })();

    res.status(201).json({ success: true, message: "Inquiry submitted successfully", inquiry });
  } catch (error) {
    console.error("Error in submitInquiry:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/seller/inquiries (protected)
export const getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, inquiries });
  } catch (error) {
    console.error("Error in getInquiries:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /api/seller/inquiry/:id (protected)
export const deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID", success: false });
    }
    await Inquiry.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Inquiry deleted" });
  } catch (error) {
    console.error("Error in deleteInquiry:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Bulk Upload
export * from "./bulkUpload.controller.js";

