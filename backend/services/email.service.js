import nodemailer from "nodemailer";
import Smtp from "../models/smtp.model.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// ─── Core send helper ─────────────────────────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
    const smtpSettings = await Smtp.findOne();
    if (!smtpSettings || !smtpSettings.isEnabled) {
        throw new Error("Email service is not configured or disabled");
    }

    let fromEmail = smtpSettings.user || "vickyusa@gmail.com";
    let fromName = smtpSettings.fromEmail || "Gramodaya marketplace";

    // ─── Normalize 'to' into array of { email, name } ─────────────────────────
    const rawTo = Array.isArray(to) ? to : [to];
    const recipients = await Promise.all(rawTo.map(async (item) => {
        // If it's already an object { email, name }, return it
        if (typeof item === 'object' && item.email) {
            return { email: item.email, name: item.name || "gramodian" };
        }
        // If it's a string (email), try to find name in DB
        const email = item;
        const user = await User.findOne({ email }).select("name");
        return {
            email: email,
            name: user ? user.name : "gramodian"
        };
    }));

    // ─── If Brevo service is selected (REST API) ──────────────────────────────
    if (smtpSettings.service === 'brevo') {
        const apiKey = process.env.brevo_api;
        if (!apiKey) throw new Error("brevo_api key is not configured in .env");

        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": apiKey,
                "content-type": "application/json"
            },
            body: JSON.stringify({
                sender: {
                    name: fromName,
                    email: fromEmail
                },
                to: recipients,
                subject: subject,
                htmlContent: html
            })
        });

        const text = await response.text();
        let data = {};
        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            console.error("Brevo response parsing failed:", text);
        }

        if (!response.ok) {
            throw new Error(data.message || `Failed to send email via Brevo (${response.status})`);
        }
        return { id: data.messageId };
    }

    // ─── Default: Standard SMTP (Nodemailer) ──────────────────────────────────
    /* Commented out as per request - using Brevo exclusively 
    else {
        const transporter = nodemailer.createTransport({
            host: smtpSettings.host,
            port: Number(smtpSettings.port),
            secure: Number(smtpSettings.port) === 465,
            auth: {
                user: smtpSettings.user,
                pass: smtpSettings.password,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const toStr = recipients.map(r => `"${r.name}" <${r.email}>`).join(", ");
        const info = await transporter.sendMail({ from: `"${fromName}" <${fromEmail}>`, to: toStr, subject, html });
        return { id: info.messageId };
    }
    */
    else {
        throw new Error(`Standard SMTP is disabled. Service '${smtpSettings.service}' is not supported.`);
    }
};

// ─── Common Template Wrapper ──────────────────────────────────────────────────
const emailWrapper = (content) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; color: #333; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 30px; line-height: 1.6; }
        .footer { background-color: #f9f9f9; text-align: center; padding: 20px; font-size: 12px; color: #888; border-top: 1px solid #eee; }
        .btn { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 15px; }
        .unsubscribe { margin-top: 20px; font-size: 11px; color: #aaa; text-align: center; }
        .unsubscribe a { color: #aaa; text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>Gramodaya</h1></div>
        <div class="content">${content}</div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Gramodaya. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

// ─── Send Test Email ───────────────────────────────────────────────────────────
export const sendTestEmail = async (toEmail) => {
    try {
        console.log(`[Email Test] Sending test email to ${toEmail}`);

        const html = emailWrapper(`
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #4CAF50;">Email Configuration Successful!</h2>
            </div>
            <p>Hello,</p>
            <p>This is a test email sent from the Gramodaya Admin Panel to verify that your email settings are working correctly.</p>
            <p>If you received this email, your email notifications are now active.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #888; text-align: center;">Gramodaya Admin</p>
        `);

        const data = await sendEmail({
            to: { email: toEmail, name: "Test Recipient" },
            subject: "Test Email from Gramodaya",
            html,
        });

        console.log("[Email Test] Email sent successfully:", data?.id);
        return { success: true, messageId: data?.id };
    } catch (error) {
        console.error("Error sending test email:", error);
        throw error;
    }
};

// ─── Order Confirmation to User ───────────────────────────────────────────────
export const sendOrderConfirmationEmail = async (user, order) => {
    try {
        const itemsHtml = (order.products || []).map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
            </tr>
        `).join('');

        const content = `
            <h2 style="color: #4CAF50;">Thank You for Your Order, ${user.name}!</h2>
            <p>Your order <strong>#${order._id}</strong> has been placed successfully and is currently in progress.</p>
            <p>We will notify you once it's out for delivery.</p>
            <h3 style="margin-top: 30px;">Order Details</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                    <tr style="background-color: #f9f9f9;">
                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
                        <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                        <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                    </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
                <tfoot>
                    <tr>
                        <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total Amount:</td>
                        <td style="padding: 10px; text-align: right; font-weight: bold; color: #4CAF50;">₹${order.amount.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
            <p style="margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/profile" class="btn">View Order Status</a>
            </p>
            ${order.deliveryOtp ? `
            <div style="margin:24px 0;padding:20px;background:#f0f4ff;border:2px solid #6366f1;border-radius:10px;text-align:center;">
                <p style="margin:0 0 6px;font-size:13px;color:#4f46e5;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">🔐 Your Delivery OTP</p>
                <p style="margin:0;font-size:36px;font-weight:900;letter-spacing:10px;color:#4338ca;font-family:monospace;">${order.deliveryOtp}</p>
                <p style="margin:10px 0 0;font-size:12px;color:#6b7280;">Share this with your delivery captain to confirm receipt of your order.</p>
            </div>` : ''}
        `;

        await sendEmail({
            to: { email: user.email, name: user.name },
            subject: `Order Confirmation - #${order._id}`,
            html: emailWrapper(content),
        });
    } catch (error) {
        console.error("Failed to send order confirmation email to user:", error);
    }
};

// ─── Order Notification to Admin ──────────────────────────────────────────────
export const sendOrderAdminNotification = async (user, order) => {
    try {
        const smtpSettings = await Smtp.findOne();
        if (!smtpSettings?.admins?.length) return;

        const enabledAdmins = smtpSettings.admins
            .filter(admin => admin.isEnabled)
            .map(admin => ({ email: admin.email, name: "Admin" }));
        if (enabledAdmins.length === 0) return;

        const content = `
            <h2>New Order Received!</h2>
            <p>A new order has been placed by <strong>${user.name}</strong> (${user.email}).</p>
            <p><strong>Order ID:</strong> #${order._id}</p>
            <p><strong>Total Amount:</strong> ₹${order.amount.toFixed(2)}</p>
            <p><a href="${process.env.ADMIN_URL || '#'}" class="btn">View Order in Dashboard</a></p>
        `;

        await sendEmail({
            to: enabledAdmins,
            subject: `New Order Received - #${order._id}`,
            html: emailWrapper(content),
        });
    } catch (error) {
        console.error("Failed to send order notification to admin:", error);
    }
};

// ─── Order Status Update to User ──────────────────────────────────────────────
export const sendOrderStatusUpdateEmail = async (user, order) => {
    try {
        const statusMap = {
            'Confirmed': { msg: "Good news! Your order has been confirmed and is being processed.", color: "#2196F3" },
            'In Progress': { msg: "Your order has been picked up by a delivery captain and is on its way!", color: "#7C3AED" },
            'Out for Delivery': { msg: "Your order is out for delivery and will reach you soon!", color: "#FF9800" },
            'Delivered': { msg: "Your order has been successfully delivered. We hope you enjoy your purchase!", color: "#4CAF50" },
            'Cancelled': { msg: "Your order has been cancelled.", color: "#F44336" },
            'Rejected': { msg: "Unfortunately, your order could not be fulfilled by a delivery captain. Please contact support.", color: "#F44336" },
        };

        const { msg: statusMessage, color: statusColor } = statusMap[order.status] || {
            msg: "Your order status has been updated.",
            color: "#333",
        };

        const content = `
            <h2>Order Status Update</h2>
            <p>Hello ${user.name},</p>
            <p>${statusMessage}</p>
            <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid ${statusColor}; border-radius: 4px;">
                <h3 style="margin: 0 0 10px 0; color: ${statusColor};">Status: ${order.status}</h3>
                <p style="margin: 0;"><strong>Order ID:</strong> #${order._id}</p>
            </div>
            <p><a href="${process.env.FRONTEND_URL}/profile" class="btn">Track Order</a></p>
        `;

        await sendEmail({
            to: { email: user.email, name: user.name },
            subject: `Order Update - ${order.status} - #${order._id}`,
            html: emailWrapper(content),
        });
    } catch (error) {
        console.error("Failed to send order status update email:", error);
    }
};

// ─── Newsletter ───────────────────────────────────────────────────────────────
export const sendNewsletterEmail = async (toEmail, subject, htmlContent, token) => {
    try {
        const contentWithUnsubscribe = `
            ${htmlContent}
            <div class="unsubscribe">
                <p>You are receiving this email because you subscribed to our newsletter.</p>
                <p>To stop receiving these emails, <a href="${process.env.FRONTEND_URL}/unsubscribe?token=${encodeURIComponent(token)}">unsubscribe here</a>.</p>
            </div>
        `;

        await sendEmail({
            to: { email: toEmail, name: "gramodian" },
            subject,
            html: emailWrapper(contentWithUnsubscribe),
        });
    } catch (error) {
        console.error("Failed to send newsletter email:", error);
    }
};

// ─── Captain Welcome Email ────────────────────────────────────────────────────
export const sendCaptainWelcomeEmail = async (captain, plainPassword) => {
    try {
        const content = `
            <h2>Welcome to the Delivery Team, ${captain.name}!</h2>
            <p>You have been added as a delivery captain on Gramodaya.</p>
            <p>Here are your login credentials for the captain portal:</p>
            <div style="margin: 20px 0; padding: 20px; background: #f4f7f6; border-radius: 8px; border-left: 4px solid #4CAF50;">
                <p style="margin: 8px 0;"><strong>Login URL:</strong> <a href="${process.env.FRONTEND_URL}/captain">${process.env.FRONTEND_URL}/captain</a></p>
                <p style="margin: 8px 0;"><strong>Email:</strong> ${captain.email}</p>
                <p style="margin: 8px 0;"><strong>Password:</strong> <code style="background:#e8f5e9;padding:2px 6px;border-radius:4px;font-family:monospace;">${plainPassword}</code></p>
            </div>
            <p style="color:#888;font-size:13px;">Please log in and change your password after your first login.</p>
            <p>We're excited to have you on board!</p>
        `;

        await sendEmail({
            to: { email: captain.email, name: captain.name },
            subject: `Welcome to Gramodaya - Captain Login Details`,
            html: emailWrapper(content),
        });
    } catch (error) {
        console.error("Failed to send captain welcome email:", error);
    }
};

// ─── Captain Order Assignment Notification ────────────────────────────────────
export const sendCaptainOrderNotification = async (captain, order, customer, address) => {
    try {
        const itemsHtml = order.products.map(item => `
            <tr>
                <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td>
                <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
            </tr>
        `).join('');

        const content = `
            <h2>📦 New Delivery Assigned to You!</h2>
            <p>Hello ${captain.name},</p>
            <p>You have been assigned a new delivery order. Please log in to the captain portal to accept or reject it.</p>
            <div style="margin:20px 0;padding:20px;background:#f4f7f6;border-radius:8px;border-left:4px solid #4CAF50;">
                <p style="margin:6px 0;"><strong>Order ID:</strong> #${order._id}</p>
                <p style="margin:6px 0;"><strong>Customer:</strong> ${customer.name}</p>
                <p style="margin:6px 0;"><strong>Address:</strong> ${address.street}, ${address.city}, ${address.state} - ${address.zipcode}</p>
                <p style="margin:6px 0;"><strong>Total:</strong> ₹${order.amount.toFixed(2)}</p>
            </div>
            <h3>Items to Deliver:</h3>
            <table style="width:100%;border-collapse:collapse;">
                <thead><tr style="background:#f9f9f9;"><th style="padding:8px;text-align:left;">Item</th><th style="padding:8px;text-align:center;">Qty</th></tr></thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            <p style="margin-top:20px;"><a href="${process.env.FRONTEND_URL}/captain" class="btn">Go to Captain Portal</a></p>
            <p style="color:#888;font-size:13px;">Please respond to this delivery request within a reasonable time.</p>
        `;

        await sendEmail({
            to: { email: captain.email, name: captain.name },
            subject: `New Delivery Assigned - Order #${order._id}`,
            html: emailWrapper(content),
        });
    } catch (error) {
        console.error("Failed to send captain order notification email:", error);
    }
};

// ─── Order Rejected Email to Customer ────────────────────────────────────────
export const sendOrderRejectedEmail = async (user, order) => {
    try {
        const content = `
            <h2>Order Update - #${order._id}</h2>
            <p>Hello ${user.name},</p>
            <p>We're sorry to inform you that your order <strong>#${order._id}</strong> could not be assigned to a delivery captain at this time.</p>
            <div style="margin:20px 0;padding:15px;background:#fff3f3;border-left:4px solid #F44336;border-radius:4px;">
                <h3 style="margin:0 0 8px 0;color:#F44336;">Status: Order Rejected</h3>
                <p style="margin:0;">Unfortunately, no captain was available to accept your delivery. Please contact support for assistance.</p>
            </div>
            <p>We sincerely apologize for the inconvenience.</p>
            <p><a href="${process.env.FRONTEND_URL}/profile/orders" class="btn">View My Orders</a></p>
        `;

        await sendEmail({
            to: { email: user.email, name: user.name },
            subject: `Order Rejected - #${order._id}`,
            html: emailWrapper(content),
        });
    } catch (error) {
        console.error("Failed to send order rejected email:", error);
    }
};

// ─── Delivery Confirmation + Review Links ─────────────────────────────────────
export const sendDeliveryConfirmationEmail = async (user, order) => {
    try {
        const items = (order.items || []).filter(i => i.product);
        const productReviewBlocks = items.map(item => {
            const product = item.product;
            const productId = product._id;
            const productName = product.name || "Product";

            const reviewToken = jwt.sign(
                { productId: productId.toString(), orderId: order._id.toString(), userId: order.userId.toString() },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            const stars = [1, 2, 3, 4, 5].map(n => {
                const url = `${process.env.FRONTEND_URL}/review?rating=${n}&token=${reviewToken}`;
                return `<a href="${url}" style="text-decoration:none;font-size:36px;color:#f59e0b;margin:0 3px;display:inline-block;line-height:1;" title="Rate ${n} star${n > 1 ? 's' : ''}">★</a>`;
            }).join("");

            return `
                <div style="margin:12px 0;padding:14px 16px;background:#fffdf0;border:1px solid #fde68a;border-radius:10px;">
                    <p style="margin:0 0 4px;font-weight:700;color:#1e293b;font-size:14px;">${productName}</p>
                    <p style="margin:0 0 10px;font-size:12px;color:#94a3b8;">Qty: ${item.quantity} &nbsp;·&nbsp; Click a star to rate</p>
                    <div>${stars}</div>
                </div>`;
        }).join("");

        const content = `
            <h2 style="color:#4CAF50;">🎉 Order Delivered Successfully!</h2>
            <p>Hello ${user.name},</p>
            <p>Your order <strong>#${order._id}</strong> has been delivered successfully. Thank you for shopping with us!</p>
            <div style="margin:20px 0;padding:16px;background:#f0fdf4;border:2px solid #4CAF50;border-radius:10px;">
                <p style="margin:0;font-size:15px;color:#166534;font-weight:700;">✅ Delivery Confirmed</p>
                <p style="margin:6px 0 0;font-size:13px;color:#4CAF50;">Total: ₹${order.amount} via ${order.paymentType}</p>
            </div>
            <h3 style="color:#1e293b;margin-bottom:8px;">⭐ Rate Your Purchase</h3>
            <p style="font-size:13px;color:#64748b;margin-bottom:12px;">Click on the stars to rate each product — it takes just a second!</p>
            ${productReviewBlocks}
            <p style="margin-top:24px;">
                <a href="${process.env.FRONTEND_URL}/profile/orders" class="btn">View Order Details</a>
            </p>
        `;

        await sendEmail({
            to: { email: user.email, name: user.name },
            subject: `Order Delivered — Share Your Review! #${order._id}`,
            html: emailWrapper(content),
        });
    } catch (error) {
        console.error("Failed to send delivery confirmation email:", error);
    }
};

// ─── Verification Email ───────────────────────────────────────────────────────
export const sendVerificationEmail = async (toEmail, name, verificationToken) => {
    try {
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

        const content = `
            <h2>Welcome to Gramodaya, ${name}!</h2>
            <p>Thank you for registering. Please verify your email address to activate your account.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" class="btn" style="padding: 12px 24px; font-size: 16px;">Verify Email Address</a>
            </div>
            <p style="font-size: 14px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="font-size: 14px; word-break: break-all; color: #4CAF50;">${verificationUrl}</p>
            <p style="margin-top: 30px;">If you didn't create an account, you can safely ignore this email.</p>
        `;

        await sendEmail({
            to: { email: toEmail, name: name },
            subject: "Verify Your Email Address",
            html: emailWrapper(content),
        });
    } catch (error) {
        console.error("Failed to send verification email:", error);
    }
};

// ─── Low Stock Alert to Admins ────────────────────────────────────────────────
export const sendLowStockAlertEmail = async (products, adminEmails) => {
    try {
        const rows = products.map(p => `
            <tr>
                <td style="padding:10px 12px;border-bottom:1px solid #eee;font-weight:600;color:#1e293b;">${p.name}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#64748b;">${p.category || "—"}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center;">
                    <span style="display:inline-block;padding:4px 10px;border-radius:20px;font-weight:700;font-size:13px;
                        background:${p.stockQuantity === 0 ? '#fee2e2' : '#fef3c7'};
                        color:${p.stockQuantity === 0 ? '#dc2626' : '#d97706'};">
                        ${p.stockQuantity === 0 ? "OUT OF STOCK" : p.stockQuantity + " left"}
                    </span>
                </td>
            </tr>
        `).join("");

        const content = `
            <h2 style="color:#dc2626;">⚠️ Low Stock Alert</h2>
            <p>The following products are running critically low on stock and need immediate restocking.</p>
            <div style="margin:20px 0;padding:16px;background:#fff7ed;border:2px solid #f97316;border-radius:10px;">
                <p style="margin:0;font-size:14px;color:#9a3412;font-weight:700;">
                    🚨 ${products.length} product${products.length > 1 ? "s" : ""} need${products.length === 1 ? "s" : ""} restocking
                </p>
            </div>
            <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-top:16px;">
                <thead>
                    <tr style="background:#f8fafc;">
                        <th style="padding:12px;text-align:left;border-bottom:2px solid #e2e8f0;color:#475569;">Product</th>
                        <th style="padding:12px;text-align:left;border-bottom:2px solid #e2e8f0;color:#475569;">Category</th>
                        <th style="padding:12px;text-align:center;border-bottom:2px solid #e2e8f0;color:#475569;">Stock Status</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
            <p style="margin-top:24px;font-size:13px;color:#64748b;">
                Please update the stock levels in the admin panel as soon as possible.
            </p>
            <p style="margin-top:10px;">
                <a href="${process.env.FRONTEND_URL}/seller/product-list" class="btn">Go to Product List</a>
            </p>
        `;

        await sendEmail({
            to: adminEmails.map(email => ({ email, name: "Admin" })),
            subject: `Low Stock Alert — ${products.length} product${products.length > 1 ? "s" : ""} need restocking`,
            html: emailWrapper(content),
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to send low stock alert email:", error);
        throw error;
    }
};

// ─── Career Application Alert to Admin/HR ────────────────────────────────────
export const sendCareerApplicationEmail = async (application, career, adminEmails) => {
    try {
        const resumeLink = application.resumeUrl;

        const content = `
            <h2 style="color:#2563eb;">📄 New Job Application Received</h2>
            <p>A new application has been submitted for the position of <strong>${career.title}</strong>.</p>
            <div style="margin:20px 0;padding:20px;background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #2563eb;border-radius:6px;">
                <p style="margin:5px 0;"><strong>Applicant Name:</strong> ${application.applicantName}</p>
                <p style="margin:5px 0;"><strong>Email:</strong> <a href="mailto:${application.applicantEmail}">${application.applicantEmail}</a></p>
                <p style="margin:5px 0;"><strong>Phone:</strong> ${application.applicantPhone || 'N/A'}</p>
                ${application.coverLetter ? `<p style="margin:10px 0 5px;"><strong>Cover Letter:</strong></p><div style="background:#fff;padding:10px;border-radius:4px;border:1px solid #e2e8f0;">${application.coverLetter.replace(/\n/g, '<br>')}</div>` : ''}
            </div>
            <div style="margin-top:20px;text-align:center;">
                <a href="${resumeLink}" class="btn" style="background-color:#2563eb;">View / Download Resume</a>
            </div>
            <p style="margin-top:30px;font-size:13px;color:#64748b;">
                To manage this application, <a href="${process.env.FRONTEND_URL}/seller/careers">log in to the Admin Dashboard</a>.
            </p>
        `;

        await sendEmail({
            to: adminEmails.map(email => ({ email, name: "Admin" })),
            subject: `New Application: ${career.title} - ${application.applicantName}`,
            html: emailWrapper(content),
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to send career application email:", error);
        throw error;
    }
};

// ─── Applicant Confirmation Email ─────────────────────────────────────────────
export const sendApplicantConfirmationEmail = async (applicantEmail, applicantName, jobTitle) => {
    try {
        const content = `
            <h2 style="color:#2563eb;">Thank You for Applying, ${applicantName}!</h2>
            <p>We've successfully received your application for the <strong>${jobTitle}</strong> position.</p>
            <p>Our team is excited to learn more about you. We typically review applications within 48 hours.</p>
            <div style="margin:25px 0;padding:20px;background:#f0fafb;border-radius:12px;border:1px solid #cffafe;">
                <h3 style="margin-top:0;color:#0891b2;font-size:16px;">What's Next? (Our Hiring Process)</h3>
                <ol style="padding-left:20px;margin-bottom:0;color:#164e63;font-size:14px;line-height:1.6;">
                    <li><strong>Application Review:</strong> Our talent team reviews your profile and experience.</li>
                    <li><strong>First Interaction:</strong> A 30-minute introductory call to align on goals.</li>
                    <li><strong>Skill Assessment:</strong> A technical deep-dive or task related to the role.</li>
                    <li><strong>Final Sync:</strong> Meet the team and discuss cultural alignment.</li>
                    <li><strong>Offer:</strong> Receive an offer and join the Gramodaya family!</li>
                </ol>
            </div>
            <p style="margin-top:20px;">We'll be in touch soon regardless of the outcome. Good luck!</p>
            <p style="margin-top:30px;font-size:12px;color:#94a3b8;">Please do not reply to this automated email.</p>
        `;

        await sendEmail({
            to: { email: applicantEmail, name: applicantName },
            subject: `Application Received: ${jobTitle} - Gramodaya`,
            html: emailWrapper(content),
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to send applicant confirmation email:", error);
    }
};

// ─── Contact Inquiry to Admin ─────────────────────────────────────────────────
export const sendContactInquiryEmail = async (inquiry, adminEmails) => {
    try {
        const content = `
            <h2 style="color:#10b981;">📩 New Contact Inquiry Received</h2>
            <p>You have a new message from the Gramodaya contact form.</p>
            <div style="margin:20px 0;padding:20px;background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #10b981;border-radius:6px;">
                <p style="margin:5px 0;"><strong>Name:</strong> ${inquiry.name}</p>
                <p style="margin:5px 0;"><strong>Email:</strong> <a href="mailto:${inquiry.email}">${inquiry.email}</a></p>
                <p style="margin:10px 0 5px;"><strong>Message:</strong></p>
                <div style="background:#fff;padding:10px;border-radius:4px;border:1px solid #e2e8f0;white-space:pre-wrap;">${inquiry.message}</div>
            </div>
            <p style="margin-top:30px;font-size:13px;color:#64748b;">
                To manage this inquiry, <a href="${process.env.FRONTEND_URL}/seller/inquiries">log in to the Admin Dashboard</a>.
            </p>
        `;

        await sendEmail({
            to: adminEmails.map(email => ({ email, name: "Admin" })),
            subject: `New Inquiry: ${inquiry.name}`,
            html: emailWrapper(content),
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to send contact inquiry email:", error);
    }
};

// ─── User Contact Confirmation ────────────────────────────────────────────────
export const sendUserContactConfirmationEmail = async (userEmail, userName) => {
    try {
        const content = `
            <h2 style="color:#10b981;">We've Received Your Message!</h2>
            <p>Hello ${userName},</p>
            <p>Thank you for reaching out to Gramodaya. We've received your inquiry and our team will get back to you within 24 hours.</p>
            <div style="margin:25px 0;padding:20px;background:#f0fdf4;border-radius:12px;border:1px solid #dcfce7;">
                <p style="margin:0;color:#166534;font-size:14px;line-height:1.6;">
                    "At Gramodaya, every community voice matters. Whether it's a question about our village-sourced products or feedback for improvement, we're here to listen."
                </p>
            </div>
            <p>Have a great day!</p>
            <p>— Team Gramodaya</p>
        `;

        await sendEmail({
            to: { email: userEmail, name: userName },
            subject: `We've received your inquiry - Gramodaya`,
            html: emailWrapper(content),
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to send user contact confirmation email:", error);
    }
};

// ─── Reset Password Email ─────────────────────────────────────────────────────
export const sendResetPasswordEmail = async (toEmail, name, resetToken, expiresMinutes) => {
    try {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        const content = `
            <h2>Password Reset Request</h2>
            <p>Hello ${name},</p>
            <p>We received a request to reset your password. This link will expire in <strong>${expiresMinutes} minutes</strong>.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" class="btn" style="padding: 12px 24px; font-size: 16px;">Reset My Password</a>
            </div>
            <p style="font-size: 14px; color: #666;">If the button doesn't work, copy and paste this link:</p>
            <p style="font-size: 14px; word-break: break-all; color: #4CAF50;">${resetUrl}</p>
            <p style="margin-top: 30px;">If you didn't request a password reset, you can safely ignore this email.</p>
        `;

        await sendEmail({
            to: { email: toEmail, name: name },
            subject: "Reset Your Password",
            html: emailWrapper(content),
        });
    } catch (error) {
        console.error("Failed to send reset password email:", error);
    }
};

// ─── Cloudinary Error Alert to Admins ────────────────────────────────────────
export const sendCloudinaryErrorEmail = async (context, errorMessage) => {
    try {
        const smtpSettings = await Smtp.findOne();
        if (!smtpSettings?.isEnabled) return;

        const adminEmails = (smtpSettings.admins || [])
            .filter(a => a.isEnabled && a.notifications?.cloudinaryError !== false)
            .map(a => a.email);
        if (adminEmails.length === 0) return;

        const content = `
            <h2 style="color:#dc2626;">⚠️ Cloudinary Upload Error</h2>
            <p>A file upload to Cloudinary has failed on your Gramodaya store.</p>
            <div style="margin:20px 0;padding:20px;background:#fef2f2;border:2px solid #fca5a5;border-radius:10px;">
                <p style="margin:0 0 8px;font-weight:700;color:#991b1b;">Context:</p>
                <p style="margin:0 0 12px;color:#7f1d1d;font-size:14px;">${context}</p>
                <p style="margin:0 0 4px;font-weight:700;color:#991b1b;">Error Message:</p>
                <pre style="margin:0;background:#fff;padding:10px;border-radius:6px;font-size:12px;color:#b91c1c;white-space:pre-wrap;word-break:break-all;">${errorMessage}</pre>
            </div>
            <p style="font-size:13px;color:#64748b;">
                Please check your Cloudinary credentials and storage limits.
            </p>
            <p style="margin-top:20px;">
                <a href="${process.env.FRONTEND_URL}/seller" class="btn" style="background:#dc2626;">Go to Admin Panel</a>
            </p>
        `;

        await sendEmail({
            to: adminEmails.map(email => ({ email, name: "Admin" })),
            subject: `⚠️ Cloudinary Error — ${context}`,
            html: emailWrapper(content),
        });
    } catch (error) {
        console.error("Failed to send Cloudinary error email:", error);
    }
};