import Career from "../models/career.model.js";
import Application from "../models/application.model.js";
import Smtp from "../models/smtp.model.js";
import { sendCareerApplicationEmail } from "../services/email.service.js";
import fs from "fs";
import path from "path";

// ----------------------------------------------------
// ADMIN CONTROLLERS
// ----------------------------------------------------

export const createCareer = async (req, res) => {
    try {
        const { title, description, requirements, location, type, salaryRange, status } = req.body;
        let bannerUrl = "";

        // Check if a banner image was uploaded
        if (req.files && req.files.banner && req.files.banner.length > 0) {
            bannerUrl = req.files.banner[0].filename;
        }

        if (!title || !description || !location || !type) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const career = new Career({
            title,
            description,
            requirements: requirements ? JSON.parse(requirements) : [],
            location,
            type,
            salaryRange,
            bannerUrl,
            status: status || "Open"
        });

        const savedCareer = await career.save();
        return res.status(201).json({ success: true, career: savedCareer, message: "Career added successfully" });
    } catch (error) {
        console.error("Error creating career:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const updateCareer = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, requirements, location, type, salaryRange, status } = req.body;

        const career = await Career.findById(id);
        if (!career) return res.status(404).json({ success: false, message: "Career not found" });

        // Handle optional banner update
        let bannerUrl = career.bannerUrl;
        if (req.files && req.files.banner && req.files.banner.length > 0) {
            // Remove old banner if exists
            if (bannerUrl) {
                const oldPath = path.join(process.cwd(), 'uploads', bannerUrl);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            bannerUrl = req.files.banner[0].filename;
        }

        career.title = title || career.title;
        career.description = description || career.description;
        career.requirements = requirements ? JSON.parse(requirements) : career.requirements;
        career.location = location || career.location;
        career.type = type || career.type;
        career.salaryRange = salaryRange || career.salaryRange;
        career.status = status || career.status;
        career.bannerUrl = bannerUrl;

        const updatedCareer = await career.save();
        return res.status(200).json({ success: true, career: updatedCareer, message: "Career updated successfully" });
    } catch (error) {
        console.error("Error updating career:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const deleteCareer = async (req, res) => {
    try {
        const { id } = req.params;
        const career = await Career.findById(id);
        if (!career) return res.status(404).json({ success: false, message: "Career not found" });

        if (career.bannerUrl) {
            const bannerPath = path.join(process.cwd(), 'uploads', career.bannerUrl);
            if (fs.existsSync(bannerPath)) fs.unlinkSync(bannerPath);
        }

        // Delete associated applications and their resumes
        const applications = await Application.find({ careerId: id });
        for (const app of applications) {
            if (app.resumeUrl) {
                const resumePath = path.join(process.cwd(), 'uploads', app.resumeUrl);
                if (fs.existsSync(resumePath)) fs.unlinkSync(resumePath);
            }
        }
        await Application.deleteMany({ careerId: id });
        await Career.findByIdAndDelete(id);

        return res.status(200).json({ success: true, message: "Career deleted successfully" });
    } catch (error) {
        console.error("Error deleting career:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const getAdminCareers = async (req, res) => {
    try {
        const careers = await Career.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, careers });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const getCareerApplications = async (req, res) => {
    try {
        const applications = await Application.find().populate("careerId", "title").sort({ createdAt: -1 });
        return res.status(200).json({ success: true, applications });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const application = await Application.findByIdAndUpdate(id, { status }, { new: true });
        if (!application) return res.status(404).json({ success: false, message: "Application not found" });
        return res.status(200).json({ success: true, application, message: "Status updated" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ----------------------------------------------------
// CLIENT CONTROLLERS
// ----------------------------------------------------

export const getActiveCareers = async (req, res) => {
    try {
        const careers = await Career.find({ status: "Open" }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, careers });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const getCareerById = async (req, res) => {
    try {
        const { id } = req.params;
        const career = await Career.findById(id);
        if (!career) return res.status(404).json({ success: false, message: "Career not found" });
        return res.status(200).json({ success: true, career });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const applyForCareer = async (req, res) => {
    try {
        const { id } = req.params; // Career ID
        const { applicantName, applicantEmail, applicantPhone, coverLetter } = req.body;

        if (!req.files || !req.files.resume || req.files.resume.length === 0) {
            return res.status(400).json({ success: false, message: "Resume is required" });
        }
        const resumeUrl = req.files.resume[0].filename;

        const career = await Career.findById(id);
        if (!career) return res.status(404).json({ success: false, message: "Career not found" });

        const application = new Application({
            careerId: id,
            applicantName,
            applicantEmail,
            applicantPhone,
            resumeUrl,
            coverLetter
        });

        const savedApplication = await application.save();

        // Find HR emails to send notification
        const smtpSettings = await Smtp.findOne();
        if (smtpSettings && smtpSettings.isEnabled) {
            const eligibleAdmins = (smtpSettings.admins || []).filter(a => {
                return a.isEnabled && a.notifications?.careerApplication !== false;
            }).map(a => a.email);

            if (eligibleAdmins.length > 0) {
                await sendCareerApplicationEmail(savedApplication, career, eligibleAdmins);
            }
        }

        return res.status(201).json({ success: true, message: "Application submitted successfully" });
    } catch (error) {
        console.error("Error applying for career:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};
