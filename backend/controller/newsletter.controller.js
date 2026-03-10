import Newsletter from "../models/newsletter.model.js";
import crypto from "crypto";
import { sendNewsletterEmail } from "../services/email.service.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";
import User from "../models/user.model.js";

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public or Admin manually adding
export const subscribe = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        // Check if the email is already in the list
        const existingSubscriber = await Newsletter.findOne({ email });
        if (existingSubscriber) {
            return res.status(400).json({ success: false, message: "Email is already in the list" });
        }

        const token = crypto.randomBytes(32).toString('hex');

        await Newsletter.create({
            email,
            token
        });

        res.status(201).json({ success: true, message: "Successfully added to the mailing list" });
    } catch (error) {
        console.error("Error subscribing to newsletter:", error);
        res.status(500).json({ success: false, message: "Failed to subscribe" });
    }
};

// @desc    Unsubscribe from newsletter
// @route   POST /api/newsletter/unsubscribe
// @access  Public
export const unsubscribe = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ success: false, message: "Invalid or missing token" });
        }

        const subscriber = await Newsletter.findOneAndDelete({ token });

        if (!subscriber) {
            return res.status(404).json({ success: false, message: "Subscriber not found or already unsubscribed" });
        }

        res.status(200).json({ success: true, message: "Successfully unsubscribed" });
    } catch (error) {
        console.error("Error unsubscribing:", error);
        res.status(500).json({ success: false, message: "Failed to unsubscribe" });
    }
};

// @desc    Get all subscribers
// @route   GET /api/newsletter/subscribers
// @access  Private (Admin)
export const getSubscribers = async (req, res) => {
    try {
        const subscribers = await Newsletter.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, subscribers });
    } catch (error) {
        console.error("Error fetching subscribers:", error);
        res.status(500).json({ success: false, message: "Failed to fetch subscribers" });
    }
};

// @desc    Remove subscriber manually
// @route   DELETE /api/newsletter/subscribers/:id
// @access  Private (Admin)
export const removeSubscriber = async (req, res) => {
    try {
        const { id } = req.params;
        await Newsletter.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Subscriber removed successfully" });
    } catch (error) {
        console.error("Error removing subscriber:", error);
        res.status(500).json({ success: false, message: "Failed to remove subscriber" });
    }
};

// @desc    Send newsletter to all subscribers
// @route   POST /api/newsletter/send
// @access  Private (Admin)
export const sendNewsletter = async (req, res) => {
    try {
        const { subject, htmlContent } = req.body;

        if (!subject || !htmlContent) {
            return res.status(400).json({ success: false, message: "Subject and HTML content are required" });
        }

        const subscribers = await Newsletter.find();

        if (subscribers.length === 0) {
            return res.status(404).json({ success: false, message: "No subscribers found to send newsletter" });
        }

        res.status(200).json({
            success: true,
            message: `Newsletter sending initiated to ${subscribers.length} subscribers`
        });

        // Fire and forget the email sending loop so it runs in the background
        setImmediate(async () => {
            let successCount = 0;
            let failureCount = 0;

            for (const subscriber of subscribers) {
                try {
                    await sendNewsletterEmail(subscriber.email, subject, htmlContent, subscriber.token);
                    successCount++;
                } catch (err) {
                    console.error(`Failed to send newsletter to ${subscriber.email}: `, err);
                    failureCount++;
                }
            }

            console.log(`Newsletter sending complete: ${successCount} successful, ${failureCount} failed.`);
        });

    } catch (error) {
        console.error("Error sending newsletter:", error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Failed to initiate sending newsletter" });
        }
    }
};

// @desc    Upload image for newsletter (Cloudinary)
// @route   POST /api/newsletter/upload-image
// @access  Private (Admin)
export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No image file provided" });
        }

        // ── Upload to Cloudinary /newsletter folder ────────────────────────
        const result = await uploadBufferToCloudinary(req.file.buffer, "newsletter");

        // ── OLD: upload from disk path + local file cleanup (commented out) ─
        // const result = await cloudinary.uploader.upload(req.file.path, {
        //     folder: "newsletter_images",
        //     resource_type: "auto",
        // });
        // if (fs.existsSync(req.file.path)) {
        //     fs.unlinkSync(req.file.path);
        // }

        res.status(200).json({
            success: true,
            data: {
                link: result.secure_url
            }
        });
    } catch (error) {
        console.error("Error uploading newsletter image:", error);

        // Notify admins of Cloudinary error
        try {
            const { sendCloudinaryErrorEmail } = await import("../services/email.service.js");
            await sendCloudinaryErrorEmail("Newsletter — image upload failed", error.message || String(error));
        } catch (e) {
            console.error("Failed to send Cloudinary error notification:", e);
        }

        res.status(500).json({ success: false, message: "Image upload failed. Admins have been notified." });
    }
};
