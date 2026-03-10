import mongoose from "mongoose";
const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, ref: "User" },
    items: [
      {
        product: { type: String, required: true, ref: "Product" },
        quantity: { type: Number, required: true },
      },
    ],
    amount: { type: Number, required: true },
    address: { type: String, required: true, ref: "Address" },
    status: { type: String, default: "Order Placed" },
    paymentType: { type: String, required: true },
    isPaid: { type: Boolean, required: true, default: false },
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
