import Category from "../models/category.model.js";
import Product from "../models/product.model.js";
import fs from "fs";
import path from "path";
import { uploadBufferToCloudinary, deleteFromCloudinary, publicIdFromUrl } from "../utils/cloudinaryUpload.js";

// ──────────────────────────────────────────────────────────
// HELPER: notify admins of cloudinary error
// ──────────────────────────────────────────────────────────
const notifyCloudinaryError = async (context, error) => {
    try {
        const { sendCloudinaryErrorEmail } = await import("../services/email.service.js");
        await sendCloudinaryErrorEmail(context, error.message || String(error));
    } catch (e) {
        console.error("Failed to send Cloudinary error notification:", e);
    }
};

export const addCategory = async (req, res) => {
    try {
        const { name, bgColor } = req.body;
        const imageFile = req.file;

        if (!name || !imageFile) {
            return res.status(400).json({ success: false, message: "Category name and image are required" });
        }

        const existing = await Category.findOne({ name });
        if (existing) {
            return res.status(400).json({ success: false, message: "Category already exists" });
        }

        // ── Upload to Cloudinary ─────────────────────────────────────────────
        let imageUrl = "";
        try {
            const result = await uploadBufferToCloudinary(imageFile.buffer, "category");
            imageUrl = result.secure_url;
        } catch (cloudErr) {
            console.error("Cloudinary upload error (addCategory):", cloudErr);
            await notifyCloudinaryError("Add Category — image upload failed", cloudErr);
            return res.status(500).json({ success: false, message: "Image upload failed. Admins have been notified." });
        }

        const category = new Category({
            name,
            image: imageUrl,
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
        const categories = await Category.find({}).sort({ order: 1, _id: 1 });
        res.status(200).json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const reorderCategories = async (req, res) => {
    try {
        const { orderedIds } = req.body;

        if (!orderedIds || !Array.isArray(orderedIds)) {
            return res.status(400).json({ success: false, message: "Invalid ordered array provided" });
        }

        // Use bulkWrite to perform multiple individual updates in a single database operation
        const bulkOps = orderedIds.map((id, index) => ({
            updateOne: {
                filter: { _id: id },
                update: { $set: { order: index } }
            }
        }));

        await Category.bulkWrite(bulkOps);

        res.status(200).json({ success: true, message: "Categories reordered successfully" });
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

        // ── Delete from Cloudinary ───────────────────────────────────────────
        if (category.image && category.image.includes("cloudinary.com")) {
            const publicId = publicIdFromUrl(category.image);
            if (publicId) {
                try {
                    await deleteFromCloudinary(publicId);
                } catch (cloudErr) {
                    console.error("Cloudinary delete error (deleteCategory):", cloudErr);
                    // We don't block deletion of DB record if Cloudinary fails
                }
            }
        } else if (category.image) {
            // Delete image file from uploads folder (legacy local files)
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
