import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

import { sendOrderConfirmationEmail, sendOrderAdminNotification, sendOrderStatusUpdateEmail } from "../services/email.service.js";
import User from "../models/user.model.js";

// Place order COD: /api/order/place
export const placeOrderCOD = async (req, res) => {
  try {
    const userId = req.user;
    const { items, address } = req.body;
    if (!address || !items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid order details", success: false });
    }
    // calculate amount using items;
    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    // Add tex charfe 2%
    amount += Math.floor((amount * 2) / 100);
    const newOrder = await Order.create({
      userId,
      items,
      address,
      amount,
      paymentType: "COD",
      isPaid: false,
    });

    // Increment orderCount for each product
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { orderCount: 1 } });
    }

    // Send emails asynchronously (don't await)
    (async () => {
      try {
        const user = await User.findById(userId);
        // Fetch populated order for email
        const populatedOrder = await Order.findById(newOrder._id).populate("items.product");

        const orderDataForEmail = {
          _id: populatedOrder._id,
          amount: populatedOrder.amount,
          products: populatedOrder.items.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.offerPrice
          }))
        };

        if (user) {
          sendOrderConfirmationEmail(user, orderDataForEmail);
          sendOrderAdminNotification(user, orderDataForEmail);
        }
      } catch (emailError) {
        console.error("Failed to send order emails on COD completion:", emailError);
      }
    })();

    res
      .status(201)
      .json({ message: "Order placed successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Order Status: /api/order/status/:id
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Order Placed', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status", success: false });
    }

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

    if (!order) {
      return res.status(404).json({ message: "Order not found", success: false });
    }

    // Send status update email asynchronously
    (async () => {
      try {
        const user = await User.findById(order.userId);
        if (user) {
          sendOrderStatusUpdateEmail(user, order);
        }
      } catch (emailError) {
        console.error("Failed to send status update email:", emailError);
      }
    })();

    res.status(200).json({ message: "Order status updated", success: true, order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// oredr details for individual user :/api/order/user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user;
    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// get all orders for admin :/api/order/all
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
