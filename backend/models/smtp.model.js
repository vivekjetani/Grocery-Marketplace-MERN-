import mongoose from 'mongoose';

const smtpSchema = new mongoose.Schema({
    host: {
        type: String,
        required: true,
    },
    port: {
        type: Number,
        required: true,
        default: 587,
    },
    user: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    admins: [
        {
            email: { type: String, required: true },
            isEnabled: { type: Boolean, default: true }
        }
    ],
    fromEmail: {
        type: String,
        required: true,
    },
    isEnabled: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

const Smtp = mongoose.model('Smtp', smtpSchema);

export default Smtp;
