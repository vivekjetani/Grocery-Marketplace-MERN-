import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Captain from "../models/captain.model.js";
import Order from "../models/order.model.js";
import Address from "../models/address.model.js";
import User from "../models/user.model.js";
import {
    sendOrderRejectedEmail,
    sendDeliveryConfirmationEmail,
} from "../services/email.service.js";

// Captain Login: POST /api/captain/login
export const captainLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password required", success: false });
        }

        const captain = await Captain.findOne({ email });
        if (!captain) {
            return res
                .status(400)
                .json({ message: "Invalid credentials", success: false });
        }

        const isMatch = await bcrypt.compare(password, captain.password);
        if (!isMatch) {
            return res
                .status(400)
                .json({ message: "Invalid credentials", success: false });
        }

        const token = jwt.sign(
            { captainId: captain._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("captainToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: "Login successful",
            success: true,
            captain: { _id: captain._id, name: captain.name, email: captain.email },
        });
    } catch (error) {
        console.error("Error in captainLogin:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Check Captain Auth: GET /api/captain/is-auth
export const checkCaptainAuth = async (req, res) => {
    try {
        const captain = await Captain.findById(req.captainId).select("-password");
        if (!captain) {
            return res
                .status(404)
                .json({ message: "Captain not found", success: false });
        }
        res.status(200).json({ success: true, captain });
    } catch (error) {
        console.error("Error in checkCaptainAuth:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Captain Logout: GET /api/captain/logout
export const captainLogout = async (req, res) => {
    try {
        res.clearCookie("captainToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict",
        });
        return res
            .status(200)
            .json({ message: "Logged out successfully", success: true });
    } catch (error) {
        console.error("Error in captainLogout:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get Captain's Assigned Orders: GET /api/captain/orders
export const getCaptainOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            captainId: req.captainId,
            captainStatus: { $in: ["Pending", "Accepted"] },
        })
            .populate("items.product")
            .populate("address")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("Error in getCaptainOrders:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Respond to Order (accept / reject): POST /api/captain/respond/:id
export const respondToOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // "accept" or "reject"

        const order = await Order.findOne({
            _id: id,
            captainId: req.captainId,
            captainStatus: "Pending",
        });

        if (!order) {
            return res
                .status(404)
                .json({ message: "Order not found or already responded", success: false });
        }

        if (action === "accept") {
            order.captainStatus = "Accepted";
            order.status = "In Progress";
            await order.save();

            const populatedOrder = await Order.findById(order._id).populate("items.product");
            // Stock is now deducted at order placement, so no deduction needed here.

            // Mark captain as busy
            await Captain.findByIdAndUpdate(req.captainId, { isBusy: true });

            return res
                .status(200)
                .json({ message: "Order accepted", success: true, order });
        } else if (action === "reject") {
            // Reject the order — no re-assignment (1 chance only per user's spec)
            order.captainStatus = "Rejected";
            order.status = "Rejected";
            order.captainId = null;
            await order.save();

            // Restore stock since order is permanently rejected
            const rejectedOrder = await Order.findById(order._id).populate("items.product");
            if (rejectedOrder) {
                for (const item of rejectedOrder.items) {
                    if (!item.product) continue;
                    const pId = item.product._id || item.product;
                    await Product.findByIdAndUpdate(pId, [
                        { $set: { stockQuantity: { $add: ["$stockQuantity", item.quantity] } } },
                        { $set: { inStock: { $gt: ["$stockQuantity", 0] } } }
                    ]);
                }
            }

            // Send rejection email to customer
            (async () => {
                try {
                    const user = await User.findById(order.userId);
                    if (user) {
                        sendOrderRejectedEmail(user, order);
                    }
                } catch (emailError) {
                    console.error("Failed to send rejection email:", emailError);
                }
            })();

            return res
                .status(200)
                .json({ message: "Order rejected", success: true });
        } else {
            return res
                .status(400)
                .json({ message: "Invalid action. Use 'accept' or 'reject'", success: false });
        }
    } catch (error) {
        console.error("Error in respondToOrder:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Confirm Delivery via OTP: POST /api/captain/confirm/:id
export const confirmDelivery = async (req, res) => {
    try {
        const { id } = req.params;
        const { otp } = req.body;

        if (!otp) {
            return res
                .status(400)
                .json({ message: "OTP is required", success: false });
        }

        const order = await Order.findOne({
            _id: id,
            captainId: req.captainId,
            captainStatus: "Accepted",
        });

        if (!order) {
            return res
                .status(404)
                .json({ message: "Order not found or not in accepted state", success: false });
        }

        if (order.deliveryOtp !== String(otp)) {
            return res
                .status(400)
                .json({ message: "Invalid OTP", success: false });
        }

        // OTP matches — mark delivered
        order.captainStatus = "Delivered";
        order.status = "Delivered";
        await order.save();

        // Free the captain
        await Captain.findByIdAndUpdate(req.captainId, { isBusy: false });

        // Send delivery confirmation email to customer (async)
        (async () => {
            try {
                const user = await User.findById(order.userId);
                const populatedOrder = await Order.findById(order._id).populate("items.product");
                if (user && populatedOrder) {
                    sendDeliveryConfirmationEmail(user, populatedOrder);
                }
            } catch (emailError) {
                console.error("Failed to send delivery confirmation email:", emailError);
            }
        })();

        return res.status(200).json({
            message: "Delivery confirmed! Order marked as delivered.",
            success: true,
        });
    } catch (error) {
        console.error("Error in confirmDelivery:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
