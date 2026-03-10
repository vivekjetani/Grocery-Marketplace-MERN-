import { cloudinary } from "../config/cloudinary.js";

/**
 * Upload a file buffer to Cloudinary using upload_stream.
 * @param {Buffer} buffer   - The file buffer from multer memoryStorage
 * @param {string} folder   - Cloudinary folder (e.g. "products", "careers", "newsletter")
 * @param {object} options  - Extra cloudinary options (resource_type, etc.)
 * @returns {Promise<object>} Cloudinary upload result
 */
export const uploadBufferToCloudinary = (buffer, folder, options = {}) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: "auto", ...options },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        stream.end(buffer);
    });
};

/**
 * Delete an asset from Cloudinary by its public_id.
 * Safely ignores errors (e.g. already deleted).
 * @param {string} publicId
 * @param {string} resourceType - "image" | "video" | "raw"
 */
export const deleteFromCloudinary = async (publicId, resourceType = "image") => {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (err) {
        console.warn(`Cloudinary delete warning for ${publicId}:`, err.message);
    }
};

/**
 * Extract the Cloudinary public_id from a secure URL.
 * e.g. "https://res.cloudinary.com/<cloud>/image/upload/v123/products/abc.jpg"
 *       → "products/abc"
 */
export const publicIdFromUrl = (url) => {
    try {
        const parts = url.split("/upload/");
        if (parts.length < 2) return null;
        // Remove version segment (vXXXXX/) if present, then strip extension
        const withoutVersion = parts[1].replace(/^v\d+\//, "");
        return withoutVersion.replace(/\.[^/.]+$/, ""); // strip extension
    } catch {
        return null;
    }
};
