import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

// add product :/api/product/add
export const addProduct = async (req, res) => {
  try {
    const { name, price, offerPrice, description, category } = req.body;
    // const image = req.files?.map((file) => `/uploads/${file.filename}`);
    const image = req.files?.map((file) => file.filename);
    if (
      !name ||
      !price ||
      !offerPrice ||
      !description ||
      !category ||
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
