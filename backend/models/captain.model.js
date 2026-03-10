import mongoose from "mongoose";

const captainSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        // isBusy: true when captain has an accepted order that is not yet delivered/rejected
        isBusy: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Captain = mongoose.model("Captain", captainSchema);
export default Captain;
