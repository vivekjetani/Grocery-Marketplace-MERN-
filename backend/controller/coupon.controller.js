import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";

// Apply coupon code
export const applyCoupon = async (req, res) => {
    try {
        const { code, cartTotal } = req.body;
        const userId = req.user;

        if (!code) {
            return res.status(400).json({ success: false, message: "Coupon code is required" });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({ success: false, message: "Invalid coupon code" });
        }

        if (!coupon.isActive) {
            return res.status(400).json({ success: false, message: "This coupon is no longer active" });
        }

        if (coupon.expirationDate && new Date(coupon.expirationDate) < new Date()) {
            return res.status(400).json({ success: false, message: "This coupon has expired" });
        }

        // Special logic for WELCOME50
        if (coupon.code === "WELCOME50") {
            const userOrdersCount = await Order.countDocuments({ userId });
            if (userOrdersCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: "This coupon is only valid for your first order",
                });
            }
        }

        // Usage Limit Check
        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({
                success: false,
                message: "This coupon has reached its maximum usage limit",
            });
        }

        // Repeatability Check
        if (!coupon.isRepeatable) {
            const hasUsedBefore = await Order.findOne({ userId, couponCode: coupon.code });
            if (hasUsedBefore) {
                return res.status(400).json({
                    success: false,
                    message: "You have already used this coupon code",
                });
            }
        }

        let discountAmount = 0;
        if (coupon.discountPercentage) {
            discountAmount = (cartTotal * coupon.discountPercentage) / 100;
        } else if (coupon.flatRate) {
            discountAmount = coupon.flatRate;
        }

        // Discount cannot exceed cart total
        if (discountAmount > cartTotal) {
            discountAmount = cartTotal;
        }

        res.status(200).json({
            success: true,
            message: "Coupon applied successfully",
            discountAmount: Math.floor(discountAmount),
            couponCode: coupon.code,
            couponId: coupon._id
        });
    } catch (error) {
        console.error("Error applying coupon:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Create a coupon (admin)
export const createCoupon = async (req, res) => {
    try {
        const { code, discountPercentage, flatRate, expirationDate, isActive, usageLimit, isRepeatable } = req.body;

        if (!code) {
            return res.status(400).json({ success: false, message: "Coupon code is required" });
        }

        const uppercaseCode = code.toUpperCase();
        const existingCoupon = await Coupon.findOne({ code: uppercaseCode });

        if (existingCoupon) {
            return res.status(400).json({ success: false, message: "Coupon code already exists" });
        }

        const newCoupon = await Coupon.create({
            code: uppercaseCode,
            discountPercentage,
            flatRate,
            expirationDate,
            isActive: isActive !== undefined ? isActive : true,
            usageLimit: usageLimit !== undefined ? usageLimit : null,
            isRepeatable: isRepeatable !== undefined ? isRepeatable : true,
        });

        res.status(201).json({
            success: true,
            message: "Coupon created successfully",
            coupon: newCoupon,
        });
    } catch (error) {
        console.error("Error creating coupon:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Get all coupons (seller)
export const getCouponsForSeller = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, coupons });
    } catch (error) {
        console.error("Error in getCouponsForSeller:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Delete coupon (seller)
export const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        await Coupon.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Coupon deleted successfully" });
    } catch (error) {
        console.error("Error in deleteCoupon:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Get coupon usage details (seller)
export const getCouponUsageDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findById(id);
        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }

        const orders = await Order.find({ couponCode: coupon.code })
            .populate("userId", "name email")
            .sort({ createdAt: -1 });

        const usageData = orders.map(order => ({
            orderId: order._id,
            userName: order.userId?.name || "Unknown User",
            userEmail: order.userId?.email || "N/A",
            amount: order.amount,
            discount: order.discountAmount,
            date: order.createdAt
        }));

        res.status(200).json({
            success: true,
            coupon,
            usage: usageData
        });
    } catch (error) {
        console.error("Error in getCouponUsageDetails:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Toggle coupon status (seller)
export const toggleCouponStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findById(id);
        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }

        coupon.isActive = !coupon.isActive;
        await coupon.save();

        res.status(200).json({
            success: true,
            message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
            isActive: coupon.isActive
        });
    } catch (error) {
        console.error("Error in toggleCouponStatus:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
