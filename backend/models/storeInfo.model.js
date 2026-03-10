import mongoose from "mongoose";

const storeInfoSchema = new mongoose.Schema(
    {
        address: { type: String, default: "" },
        phone: { type: String, default: "" },
        whatsapp: { type: String, default: "" },
        email: { type: String, default: "" },
        openHours: { type: String, default: "Mon – Sat: 9 AM – 9 PM" },
        closedDays: { type: String, default: "Sunday" },
        mapLink: { type: String, default: "" },
        cancellationPolicy: {
            type: String,
            default:
                "Orders can be cancelled within 30 minutes of placing them. Once the order is picked up by our delivery captain, cancellation is not possible. For eligible cancellations, refunds are processed within 5–7 business days.",
        },
        safetyPolicy: {
            type: String,
            default:
                "We follow strict food safety standards — all products are sourced from verified suppliers, stored at optimal temperatures, and delivered with hygiene-first protocols. Your data is protected under our privacy policy and never shared with third parties.",
        },
    },
    { timestamps: true }
);

const StoreInfo = mongoose.model("StoreInfo", storeInfoSchema);
export default StoreInfo;
