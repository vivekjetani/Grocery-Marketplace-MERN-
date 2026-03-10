import mongoose from "mongoose";
const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Product" },
        quantity: { type: Number, required: true },
      },
    ],
    amount: { type: Number, required: true },
    address: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Address" },
    status: { type: String, default: "Order Placed" },
    paymentType: { type: String, required: true },
    isPaid: { type: Boolean, required: true, default: false },
    couponCode: { type: String, default: null },
    discountAmount: { type: Number, default: 0 },
    // Captain delivery fields
    captainId: { type: mongoose.Schema.Types.ObjectId, ref: "Captain", default: null },
    deliveryOtp: { type: String, default: null },
    captainStatus: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Delivered"],
      default: "Pending",
    },
  },
  { timestamps: true }
);
const Order = mongoose.model("Order", orderSchema);
export default Order;
