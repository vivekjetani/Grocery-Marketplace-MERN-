import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

// add product :/api/product/add
export const addProduct = async (req, res) => {
  try {
    const { name, price, offerPrice, description, category, unit } = req.body;
    // const image = req.files?.map((file) => `/uploads/${file.filename}`);
    const image = req.files?.map((file) => file.filename);
    if (
      !name ||
      !price ||
      !offerPrice ||
      !description ||
      !category ||
      !unit ||
      !image ||
      image.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields including images are required",
      });
    }

    const product = new Product({
      name,
      price,
      offerPrice,
      description,
      category,
      unit,
      image,
    });

    const savedProduct = await product.save();

    return res.status(201).json({
      success: true,
      product: savedProduct,
      message: "Product added successfully",
    });
  } catch (error) {
    console.error("Error in addProduct:", error);

    return res
      .status(500)
      .json({ success: false, message: "Server error while adding product" });
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
    const { id } = req.body;
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
    res
      .status(200)
      .json({ success: true, product, message: "Stock updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// get best sellers
export const getBestSellers = async (req, res) => {
  try {
    // Global best sellers based on orderCount and averageRating
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
    const userId = req.query.userId; // Optional userId for personalization

    let query = { inStock: true };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    let recommendedProducts = [];

    // If userId is provided, try to find products based on user's past orders
    if (userId) {
      const userOrders = await Order.find({ userId }).limit(10);
      if (userOrders.length > 0) {
        const purchasedCategories = [...new Set(userOrders.flatMap(order =>
          order.items.map(item => item.product.category) // This assumes product is populated or we have category in items
        ))].filter(Boolean);

        // If we don't have categories in orders directly, we might need a different approach or assume they want products from same categories
        // Let's assume we want to suggest products from categories the user has bought before
        if (purchasedCategories.length > 0) {
          recommendedProducts = await Product.find({
            ...query,
            category: { $in: purchasedCategories }
          }).sort({ averageRating: -1 }).limit(10);
        }
      }
    }

    // Fallback to category-based or global high-rated
    if (recommendedProducts.length < 5) {
      const extraQuery = { ...query };
      if (category) extraQuery.category = category;

      const extraProducts = await Product.find(extraQuery)
        .sort({ averageRating: -1, orderCount: -1 })
        .limit(10 - recommendedProducts.length);

      // Avoid duplicates
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

    // Fetch all orders containing this product
    const orders = await Order.find({
      "items.product": id,
      status: { $ne: "Cancelled" }
    });

    // Process orders for time-series data (last 30 days)
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

    // Find peak hour
    let peakHour = 0;
    let maxOrdersInHour = 0;
    hourCounts.forEach((count, hour) => {
      if (count > maxOrdersInHour) {
        maxOrdersInHour = count;
        peakHour = hour;
      }
    });

    // Formatting peak hour string
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

// ----------------------------------------------------
// NEW APIS: CATEGORY PRODUCT MANAGEMENT
// ----------------------------------------------------
import fs from "fs";
import path from "path";

// delete a single product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Delete associated images
    if (product.image && product.image.length > 0) {
      product.image.forEach((img) => {
        const imagePath = path.join(process.cwd(), 'uploads', img);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
    }

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

    // Cleanup images for all deleted products
    products.forEach((product) => {
      if (product.image && Array.isArray(product.image)) {
        product.image.forEach((img) => {
          const imagePath = path.join(process.cwd(), 'uploads', img);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        });
      }
    });

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
