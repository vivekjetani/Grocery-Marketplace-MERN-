import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
        },
        discountPercentage: {
            type: Number,
            required: false,
            min: 0,
            max: 100,
        },
        flatRate: {
            type: Number,
            required: false,
            min: 0,
        },
        expirationDate: {
            type: Date,
            required: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        usageLimit: {
            type: Number,
            required: false,
            default: null, // null means unlimited
        },
        usedCount: {
            type: Number,
            default: 0,
        },
        isRepeatable: {
            type: Boolean,
            default: true, // true means same user can use it multiple times
        },
    },
    { timestamps: true }
);

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
