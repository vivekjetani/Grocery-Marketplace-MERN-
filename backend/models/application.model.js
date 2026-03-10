import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
    {
        careerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Career",
            required: true,
        },
        applicantName: {
            type: String,
            required: true,
            trim: true,
        },
        applicantEmail: {
            type: String,
            required: true,
            trim: true,
        },
        applicantPhone: {
            type: String,
            trim: true,
        },
        resumeUrl: {
            type: String, // Cloudinary URL for the resume PDF
            required: true,
        },
        coverLetter: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["Pending", "Reviewed", "Shortlisted", "Rejected"],
            default: "Pending",
        },
    },
    { timestamps: true }
);

const Application = mongoose.model("Application", applicationSchema);
export default Application;
