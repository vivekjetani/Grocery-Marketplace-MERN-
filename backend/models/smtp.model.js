import mongoose from 'mongoose';

const smtpSchema = new mongoose.Schema({
    service: {
        type: String,
        enum: ['smtp', 'resend'],
        default: 'smtp',
    },
    host: {
        type: String,
        required: false,
    },
    port: {
        type: Number,
        required: false,
        default: 587,
    },
    user: {
        type: String,
        required: false,
    },
    password: {
        type: String,
        required: false,
    },
    admins: [
        {
            email: { type: String, required: true },
            isEnabled: { type: Boolean, default: true },
            // ── Alert schedule ──────────────────────────────────
            // frequency: 'daily' | 'alternate' | 'weekly'
            frequency: { type: String, enum: ['daily', 'alternate', 'weekly'], default: 'daily' },
            // Hour of day to send alert (0-23), default 8 → 8 AM
            alertHour: { type: Number, min: 0, max: 23, default: 8 },
            // Day of week for weekly frequency (0=Sun … 6=Sat), default 1=Monday
            alertDay: { type: Number, min: 0, max: 6, default: 1 },
            // ── Notification type toggles ──────────────────────
            notifications: {
                lowStock: { type: Boolean, default: true },  // low-stock alert
                newOrder: { type: Boolean, default: true },  // new order placed
                orderStatus: { type: Boolean, default: false },  // order status change
                dailySummary: { type: Boolean, default: false },  // daily digest
                careerApplication: { type: Boolean, default: true }, // new career application
                contactInquiry: { type: Boolean, default: true }, // new contact us message
                cloudinaryError: { type: Boolean, default: true }, // cloudinary upload failures
            }
        }
    ],
    fromEmail: {
        type: String,
        required: false,
    },
    isEnabled: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

const Smtp = mongoose.model('Smtp', smtpSchema);

export default Smtp;
