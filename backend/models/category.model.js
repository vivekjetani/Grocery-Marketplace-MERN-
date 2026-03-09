import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    image: {
        type: String,
        required: true,
    },
    bgColor: {
    },
    bgColor: {
        type: String,
        default: "#FEE0E0",
    },
    order: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

const Category = mongoose.model("Category", categorySchema);
export default Category;
