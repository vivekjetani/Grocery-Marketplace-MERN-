import Category from "../models/category.model.js";
import Product from "../models/product.model.js";
import fs from "fs";
import path from "path";

export const addCategory = async (req, res) => {
    try {
        const { name, bgColor } = req.body;
        const image = req.file?.filename;

        if (!name || !image) {
            return res.status(400).json({ success: false, message: "Category name and image are required" });
        }

        const existing = await Category.findOne({ name });
        if (existing) {
            return res.status(400).json({ success: false, message: "Category already exists" });
        }

        const category = new Category({
            name,
            image,
            bgColor: bgColor || "#FEE0E0"
        });
        await category.save();

        res.status(201).json({ success: true, message: "Category added successfully", category });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({}).sort({ name: 1 });
        res.status(200).json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "New category name is required" });
        }

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        // Check if new name already exists elsewhere
        const existing = await Category.findOne({ name, _id: { $ne: id } });
        if (existing) {
            return res.status(400).json({ success: false, message: "Category name already exists" });
        }

        const oldName = category.name;
        category.name = name;
        await category.save();

        // Sync old category name to new category name across all products
        await Product.updateMany(
            { category: oldName },
            { $set: { category: name } }
        );

        res.status(200).json({ success: true, message: "Category renamed successfully", category });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        // Delete image file from uploads folder
        if (category.image) {
            const imagePath = path.join(process.cwd(), 'uploads', category.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Category.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};
