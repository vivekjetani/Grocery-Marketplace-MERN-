import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./config/connectDB.js";
dotenv.config();
import userRoutes from "./routes/user.routes.js";
import sellerRoutes from "./routes/seller.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import addressRoutes from "./routes/address.routes.js";
import orderRoutes from "./routes/order.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import captainRoutes from "./routes/captain.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import careerRoutes from "./routes/career.routes.js";
import startCleanupJob from "./cron/cleanup.js";
import { startLowStockAlertJob } from "./cron/lowStockAlert.js";

import { connectCloudinary } from "./config/cloudinary.js";

const app = express();

await connectCloudinary();
// allow multiple origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];
//middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error("CORS policy blocked this origin"), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());
app.use(express.json());

// Api endpoints
app.use("/images", express.static("uploads"));
app.use("/api/user", userRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/captain", captainRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/career", careerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  connectDB();
  startCleanupJob();          // Daily midnight: clean up unverified accounts
  startLowStockAlertJob();   // Daily 8 AM: email admins about low-stock products
  console.log(`Server is running on port ${PORT}`);
  console.log(`FRONTEND_URL is set to: ${process.env.FRONTEND_URL}`);
});
