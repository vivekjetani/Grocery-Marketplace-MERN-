import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import { uploadBufferToCloudinary, deleteFromCloudinary, publicIdFromUrl } from "../utils/cloudinaryUpload.js";

// ──────────────────────────────────────────────────────────
// HELPER: notify admins of cloudinary error (imported lazily
// to avoid circular deps with email.service → smtp.model)
// ──────────────────────────────────────────────────────────
const notifyCloudinaryError = async (context, error) => {
  try {
    const { sendCloudinaryErrorEmail } = await import("../services/email.service.js");
    sendCloudinaryErrorEmail(context, error.message || String(error)).catch(e =>
      console.error("Background cloudinary error email failed:", e)
    );
  } catch (e) {
    console.error("Failed to send Cloudinary error notification:", e);
  }
};

// add product :/api/product/add-product
export const addProduct = async (req, res) => {
  try {
    const { name, price, offerPrice, description, category, unit, stockQuantity } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "All fields including images are required" });
    }

    if (!name || !price || !offerPrice || !description || !category || !unit) {
      return res.status(400).json({ success: false, message: "All fields including images are required" });
    }

    // ── Upload images to Cloudinary /products folder ──────────────────────
    let imageUrls = [];
    try {
      const uploadPromises = req.files.map((file) =>
        uploadBufferToCloudinary(file.buffer, "products")
      );
      const results = await Promise.all(uploadPromises);
      imageUrls = results.map((r) => r.secure_url);
    } catch (cloudErr) {
      console.error("Cloudinary upload error (addProduct):", cloudErr);
      await notifyCloudinaryError("Add Product — image upload failed", cloudErr);
      return res.status(500).json({ success: false, message: "Image upload failed. Admins have been notified." });
    }

    // ── OLD: local disk save (commented out) ──────────────────────────────
    // const image = req.files?.map((file) => file.filename);

    const qty = parseInt(stockQuantity) || 0;
    const product = new Product({
      name,
      price,
      offerPrice,
      description,
      category,
      unit,
      image: imageUrls,
      stockQuantity: qty,
      inStock: qty > 0,
    });

    const savedProduct = await product.save();

    return res.status(201).json({
      success: true,
      product: savedProduct,
      message: "Product added successfully",
    });
  } catch (error) {
    console.error("Error in addProduct:", error);
    return res.status(500).json({ success: false, message: "Server error while adding product" });
  }
};

// update stock quantity :/api/product/update-stock
export const updateStockQuantity = async (req, res) => {
  try {
    const { id, stockQuantity } = req.body;
    const qty = Math.max(0, parseInt(stockQuantity) || 0);
    const product = await Product.findByIdAndUpdate(
      id,
      { stockQuantity: qty },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, product, message: "Stock quantity updated successfully" });
  } catch (error) {
    console.error("Error in updateStockQuantity:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// get products :/api/product/get
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// get single product :/api/product/id
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// change stock  :/api/product/stock
export const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;
    const product = await Product.findByIdAndUpdate(
      id,
      { inStock },
      { new: true }
    );
    res.status(200).json({ success: true, product, message: "Stock updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// get best sellers
export const getBestSellers = async (req, res) => {
  try {
    const products = await Product.find({ inStock: true })
      .sort({ orderCount: -1, averageRating: -1, numReviews: -1 })
      .limit(10);
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// get recommended products
export const getRecommendedProducts = async (req, res) => {
  try {
    const { category, excludeId } = req.query;
    const userId = req.query.userId;

    let query = { inStock: true };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    let recommendedProducts = [];

    if (userId) {
      const userOrders = await Order.find({ userId }).limit(10);
      if (userOrders.length > 0) {
        const productIds = userOrders.flatMap(order => order.items.map(item => item.product));
        const purchasedProducts = await Product.find({ _id: { $in: productIds } });
        const purchasedCategories = [...new Set(purchasedProducts.map(p => p.category))].filter(Boolean);

        if (purchasedCategories.length > 0) {
          recommendedProducts = await Product.find({
            ...query,
            category: { $in: purchasedCategories }
          }).sort({ averageRating: -1 }).limit(10);
        }
      }
    }

    if (recommendedProducts.length < 5) {
      const extraQuery = { ...query };
      if (category) extraQuery.category = category;

      const extraProducts = await Product.find(extraQuery)
        .sort({ averageRating: -1, orderCount: -1 })
        .limit(10 - recommendedProducts.length);

      const prodIds = new Set(recommendedProducts.map(p => p._id.toString()));
      extraProducts.forEach(p => {
        if (!prodIds.has(p._id.toString())) {
          recommendedProducts.push(p);
        }
      });
    }

    res.status(200).json({ success: true, products: recommendedProducts.slice(0, 10) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// get product analytics
export const getProductAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const orders = await Order.find({
      "items.product": id,
      status: { $ne: "Cancelled" }
    });

    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last30Days.push({
        date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        fullDate: d.toISOString().split('T')[0],
        orders: 0,
        quantity: 0
      });
    }

    let totalSold = 0;
    let totalRevenue = 0;
    const hourCounts = new Array(24).fill(0);

    orders.forEach(order => {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      const orderHour = new Date(order.createdAt).getHours();
      hourCounts[orderHour]++;

      const dayData = last30Days.find(d => d.fullDate === orderDate);
      const productItem = order.items.find(item => item.product.toString() === id);
      if (productItem) {
        totalSold += productItem.quantity;
        totalRevenue += productItem.quantity * product.offerPrice;
        if (dayData) {
          dayData.orders += 1;
          dayData.quantity += productItem.quantity;
        }
      }
    });

    let peakHour = 0;
    let maxOrdersInHour = 0;
    hourCounts.forEach((count, hour) => {
      if (count > maxOrdersInHour) {
        maxOrdersInHour = count;
        peakHour = hour;
      }
    });

    const peakHourStr = `${peakHour % 12 || 12}${peakHour >= 12 ? ' PM' : ' AM'}`;

    res.status(200).json({
      success: true,
      analytics: {
        totalSold,
        totalRevenue,
        peakHour: peakHourStr,
        chartData: last30Days.map(({ date, orders, quantity }) => ({ date, orders, quantity })),
        product: {
          name: product.name,
          price: product.price,
          offerPrice: product.offerPrice,
          averageRating: product.averageRating,
          numReviews: product.numReviews,
          image: product.image[0]
        }
      }
    });
  } catch (error) {
    console.error("Error in getProductAnalytics:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// CATEGORY PRODUCT MANAGEMENT
// ──────────────────────────────────────────────────────────────────────────────

// delete a single product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // ── Delete images from Cloudinary ─────────────────────────────────────
    if (product.image && product.image.length > 0) {
      for (const imgUrl of product.image) {
        const publicId = publicIdFromUrl(imgUrl);
        if (publicId) await deleteFromCloudinary(publicId, "image");
      }
    }

    // ── OLD: local disk delete (commented out) ─────────────────────────────
    // import fs from "fs";
    // import path from "path";
    // if (product.image && product.image.length > 0) {
    //   product.image.forEach((img) => {
    //     const imagePath = path.join(process.cwd(), 'uploads', img);
    //     if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    //   });
    // }

    await Product.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// delete all products by category name
export const deleteProductsByCategory = async (req, res) => {
  try {
    const { category } = req.body;
    if (!category) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const products = await Product.find({ category });

    // ── Delete images from Cloudinary ─────────────────────────────────────
    for (const product of products) {
      if (product.image && Array.isArray(product.image)) {
        for (const imgUrl of product.image) {
          const publicId = publicIdFromUrl(imgUrl);
          if (publicId) await deleteFromCloudinary(publicId, "image");
        }
      }
    }

    // ── OLD: local disk delete (commented out) ─────────────────────────────
    // products.forEach((product) => {
    //   if (product.image && Array.isArray(product.image)) {
    //     product.image.forEach((img) => {
    //       const imagePath = path.join(process.cwd(), 'uploads', img);
    //       if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    //     });
    //   }
    // });

    await Product.deleteMany({ category });
    res.status(200).json({ success: true, message: `All products in ${category} deleted` });
  } catch (error) {
    console.error("Error in deleteProductsByCategory:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// transfer an array of products to a new category
export const transferProducts = async (req, res) => {
  try {
    const { productIds, newCategory } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ success: false, message: "Valid array of productIds is required" });
    }
    if (!newCategory) {
      return res.status(400).json({ success: false, message: "Destination category is required" });
    }

    await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: { category: newCategory } }
    );

    res.status(200).json({ success: true, message: "Products transferred successfully" });
  } catch (error) {
    console.error("Error in transferProducts:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
