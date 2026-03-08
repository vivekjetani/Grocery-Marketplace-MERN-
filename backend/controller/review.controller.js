import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";

// Add a review
export const addReview = async (req, res) => {
    try {
        const { rating, comment, productId } = req.body;
        const userId = req.user;

        if (!rating || !comment || !productId) {
            return res.status(400).json({ message: "All fields are required", success: false });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found", success: false });
        }

        // Verify purchase
        const order = await Order.findOne({
            userId,
            "items.product": productId,
            status: { $ne: "Cancelled" }, // Assume cancelled orders can't be reviewed
            $or: [{ paymentType: "COD" }, { isPaid: true }],
        });

        if (!order) {
            return res.status(403).json({
                message: "You can only review products you have purchased",
                success: false,
            });
        }

        // Check if user already reviewed
        const alreadyReviewed = await Review.findOne({ userId, productId });
        if (alreadyReviewed) {
            return res.status(400).json({ message: "Product already reviewed", success: false });
        }

        const review = new Review({
            userId,
            userName: user.name,
            rating: Number(rating),
            comment,
            productId,
        });

        await review.save();

        // Update product rating
        const reviews = await Review.find({ productId });
        product.numReviews = reviews.length;
        product.averageRating =
            reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

        await product.save();

        res.status(201).json({ message: "Review added successfully", success: true });
    } catch (error) {
        console.error("Error in addReview:", error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
};

// Get reviews for a product
export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.query;
        if (!productId) {
            return res.status(400).json({ message: "Product ID is required", success: false });
        }

        const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, reviews });
    } catch (error) {
        console.error("Error in getProductReviews:", error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
};

// Check if user can review a product
export const canReviewProduct = async (req, res) => {
    try {
        const { productId } = req.query;
        const userId = req.user;

        if (!productId) {
            return res.status(400).json({ message: "Product ID is required", success: false });
        }

        const order = await Order.findOne({
            userId,
            "items.product": productId,
            status: { $ne: "Cancelled" },
            $or: [{ paymentType: "COD" }, { isPaid: true }],
        });

        const alreadyReviewed = await Review.findOne({ userId, productId });

        res.status(200).json({
            success: true,
            canReview: !!order && !alreadyReviewed,
            bought: !!order,
            reviewed: !!alreadyReviewed,
        });
    } catch (error) {
        console.error("Error in canReviewProduct:", error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
};
