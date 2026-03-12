import cron from 'node-cron';
import Product from '../models/product.model.js';
import Smtp from '../models/smtp.model.js';
import { sendLowStockAlertEmail } from '../services/email.service.js';

const LOW_STOCK_THRESHOLD = 5;

// ─── Helper: check if an admin should receive an alert this hour ────────────
const shouldSendNow = (admin) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDayOfWeek = now.getDay();        // 0=Sun…6=Sat
    const currentDayOfYear = Math.floor(
        (now - new Date(now.getFullYear(), 0, 0)) / 86400000
    );

    // Hour must always match
    if (admin.alertHour !== currentHour) return false;

    switch (admin.frequency) {
        case 'daily':
            return true;
        case 'alternate':
            // alternate days: send on even day-of-year numbers
            return currentDayOfYear % 2 === 0;
        case 'weekly':
            return currentDayOfWeek === (admin.alertDay ?? 1);
        default:
            return true;
    }
};

// ─── Core check: send low-stock alert to qualifying admins ──────────────────
const runLowStockCheck = async (source = 'cron') => {
    console.log(`--- [Low-Stock Alert] Running check (triggered by: ${source}) ---`);
    try {
        const smtp = await Smtp.findOne();
        if (!smtp || !smtp.isEnabled || smtp.isLowStockAlertEnabled === false) {
            console.log('[Low-Stock Alert] Skipped: SMTP or Low-Stock alerts disabled globally.');
            return;
        }

        // Admins who are enabled, want low-stock alerts, and whose schedule fires now
        const eligibleAdmins = (smtp.admins || []).filter(a => {
            if (!a.isEnabled) return false;
            // Explicitly exclude the admin email from .env (case-insensitive)
            const adminEmail = a.email?.toLowerCase().trim();
            const sellerEmail = process.env.SELLER_EMAIL?.toLowerCase().trim();
            if (sellerEmail && adminEmail === sellerEmail) return false;
            
            if (source === 'cron' && !shouldSendNow(a)) return false;
            // Check notification type toggle
            const wantsLowStock = a.notifications?.lowStock === true;
            return wantsLowStock;
        });

        if (eligibleAdmins.length === 0) {
            console.log('[Low-Stock Alert] No admins scheduled for this hour.');
            return;
        }

        const lowStockProducts = await Product.find({
            stockQuantity: { $lte: LOW_STOCK_THRESHOLD },
        }).select('name stockQuantity category');

        if (!lowStockProducts || lowStockProducts.length === 0) {
            console.log('[Low-Stock Alert] All products well stocked. No alert sent.');
            return;
        }

        const adminEmails = eligibleAdmins.map(a => a.email);
        await sendLowStockAlertEmail(lowStockProducts, adminEmails);

        console.log(`[Low-Stock Alert] ✅ Success: ${lowStockProducts.length} items reported to ${adminEmails.length} admin(s).`);
    } catch (error) {
        console.error('[Low-Stock Alert] ❌ Error:', error.message);
    }
};

// ─── Run every hour at :00 — per-admin schedule is checked inside ────────────
const startLowStockAlertJob = () => {
    cron.schedule('0 * * * *', () => runLowStockCheck('hourly-cron'));
    console.log('Cron job initialized: Low-stock alert check running every hour (per-admin schedule applied).');
};

export { startLowStockAlertJob, runLowStockCheck };
