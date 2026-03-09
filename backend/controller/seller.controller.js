import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Review from "../models/review.model.js";
import Address from "../models/address.model.js";
import Smtp from "../models/smtp.model.js";
import { sendTestEmail } from "../services/email.service.js";
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
        $addFields: {
          userIdString: { $toString: "$_id" }
        }
      },
      {
        $lookup: {
          from: "orders",
          localField: "userIdString",
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
          totalSpent: { $sum: "$orders.amount" }
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
    const { host, port, user, password, admins, fromEmail, isEnabled } = req.body;
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
      await smtp.save();
    } else {
      smtp = await Smtp.create({ host, port, user, password, admins, fromEmail, isEnabled });
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
