import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true, ref: "User" },
        userName: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Product" },
    },
    { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;
