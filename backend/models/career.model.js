import mongoose from "mongoose";

const careerSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        requirements: {
            type: [String], // Array of requirement bullet points
            default: [],
        },
        location: {
            type: String,
            required: true,
            default: "Remote",
        },
        type: {
            type: String, // e.g., Full-time, Part-time, Contract
            required: true,
            default: "Full-time",
        },
        salaryRange: {
            type: String, // e.g., $80k - $120k
            default: "Competitive",
        },
        bannerUrl: {
            type: String,
            default: "", // Cloudinary URL for the LinkedIn-sized banner
        },
        status: {
            type: String,
            enum: ["Open", "Closed", "Draft"],
            default: "Open",
        },
    },
    { timestamps: true }
);

const Career = mongoose.model("Career", careerSchema);
export default Career;
