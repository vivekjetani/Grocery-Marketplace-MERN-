import nodemailer from "nodemailer";
import Smtp from "../models/smtp.model.js";
import jwt from "jsonwebtoken";

// Utility to create transporter based on DB settings
export const createTransporter = async () => {
    const smtpSettings = await Smtp.findOne();
    if (!smtpSettings || !smtpSettings.isEnabled) {
        throw new Error("SMTP is not configured or disabled");
    }

    return nodemailer.createTransport({
        host: smtpSettings.host,
        port: smtpSettings.port,
        secure: smtpSettings.port === 465, // true for 465, false for other ports
        auth: {
            user: smtpSettings.user,
            pass: smtpSettings.password,
        },
    });
};

// Send a test email
export const sendTestEmail = async (toEmail) => {
    try {
        const transporter = await createTransporter();
        const smtpSettings = await Smtp.findOne();

        const info = await transporter.sendMail({
            from: `"${smtpSettings.fromEmail}" <${smtpSettings.user}>`,
            to: toEmail,
            subject: "Test Email from Grocery Marketplace",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #4CAF50;">SMTP Setup Successful!</h2>
          </div>
          <p>Hello,</p>
          <p>This is a test email sent from the Grocery Marketplace Admin Panel to verify that your SMTP settings are working correctly.</p>
          <p>If you received this email, your email notifications are now active.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888; text-align: center;">Grocery Marketplace Admin</p>
        </div>
      `,
        });
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending test email:", error);
        throw error;
    }
};

// Common Template Wrapper Template
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
        .btn { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 15px;}
        .unsubscribe { margin-top: 20px; font-size: 11px; color: #aaa; text-align: center; }
        .unsubscribe a { color: #aaa; text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Grocery Marketplace</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Grocery Marketplace. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

// Send Order Confirmation Email to User
export const sendOrderConfirmationEmail = async (user, order) => {
    try {
        const transporter = await createTransporter();
        const smtpSettings = await Smtp.findOne();

        const itemsHtml = order.products.map(item => `
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
            <tbody>
                ${itemsHtml}
            </tbody>
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
        </div>
        ` : ''}
    `;

        await transporter.sendMail({
            from: `"${smtpSettings.fromEmail}" <${smtpSettings.user}>`,
            to: user.email,
            subject: `Order Confirmation - #${order._id}`,
            html: emailWrapper(content),
        });
    } catch (error) {
        console.error("Failed to send order confirmation email to user:", error);
    }
};

// Send Order Notification to Admin
export const sendOrderAdminNotification = async (user, order) => {
    try {
        const transporter = await createTransporter();
        const smtpSettings = await Smtp.findOne();

        if (!smtpSettings || !smtpSettings.admins || smtpSettings.admins.length === 0) return;

        const enabledAdmins = smtpSettings.admins.filter(admin => admin.isEnabled).map(admin => admin.email);
        if (enabledAdmins.length === 0) return;

        const content = `
        <h2>New Order Received!</h2>
        <p>A new order has been placed by <strong>${user.name}</strong> (${user.email}).</p>
        <p><strong>Order ID:</strong> #${order._id}</p>
        <p><strong>Total Amount:</strong> ₹${order.amount.toFixed(2)}</p>
        <p>
            <a href="${process.env.ADMIN_URL || '#'} " class="btn">View Order in Dashboard</a>
        </p>
    `;

        await transporter.sendMail({
            from: `"${smtpSettings.fromEmail}" <${smtpSettings.user}>`,
            to: enabledAdmins.join(','),
            subject: `New Order Received - #${order._id}`,
            html: emailWrapper(content),
        });
    } catch (error) {
        console.error("Failed to send order notification to admin:", error);
    }
};

// Send Order Status Update Email to User
export const sendOrderStatusUpdateEmail = async (user, order) => {
    try {
        const transporter = await createTransporter();
        const smtpSettings = await Smtp.findOne();

        let statusMessage = "Your order status has been updated.";
        let statusColor = "#333";

        switch (order.status) {
            case 'Confirmed':
                statusMessage = "Good news! Your order has been confirmed and is being processed.";
                statusColor = "#2196F3"; // Blue
                break;
            case 'In Progress':
                statusMessage = "Your order has been picked up by a delivery captain and is on its way!";
                statusColor = "#7C3AED"; // Purple
                break;
            case 'Out for Delivery':
                statusMessage = "Your order is out for delivery and will reach you soon!";
                statusColor = "#FF9800"; // Orange
                break;
            case 'Delivered':
                statusMessage = "Your order has been successfully delivered. We hope you enjoy your purchase!";
                statusColor = "#4CAF50"; // Green
                break;
            case 'Cancelled':
                statusMessage = "Your order has been cancelled.";
                statusColor = "#F44336"; // Red
                break;
            case 'Rejected':
                statusMessage = "Unfortunately, your order could not be fulfilled by a delivery captain. Please contact support.";
                statusColor = "#F44336"; // Red
                break;
        }

        const content = `
          <h2>Order Status Update</h2>
          <p>Hello ${user.name},</p>
          <p>${statusMessage}</p>
          <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid ${statusColor}; border-radius: 4px;">
              <h3 style="margin: 0 0 10px 0; color: ${statusColor};">Status: ${order.status}</h3>
              <p style="margin: 0;"><strong>Order ID:</strong> #${order._id}</p>
          </div>
          <p>
              <a href="${process.env.FRONTEND_URL}/profile" class="btn">Track Order</a>
          </p>
      `;

        await transporter.sendMail({
            from: `"${smtpSettings.fromEmail}" <${smtpSettings.user}>`,
            to: user.email,
            subject: `Order Update - ${order.status} - #${order._id}`,
            html: emailWrapper(content),
        });
    } catch (error) {
        console.error("Failed to send order status update email:", error);
    }
};

// Newsletter Template
export const sendNewsletterEmail = async (toEmail, subject, htmlContent) => {
    try {
        const transporter = await createTransporter();
        const smtpSettings = await Smtp.findOne();

        const contentWithUnsubscribe = `
          ${htmlContent}
          <div class="unsubscribe">
              <p>You are receiving this email because you subscribed to our newsletter.</p>
              <p>To stop receiving these emails, <a href="${process.env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(toEmail)}">unsubscribe here</a>.</p>
          </div>
      `;

        await transporter.sendMail({
            from: `"${smtpSettings.fromEmail}" <${smtpSettings.user}>`,
            to: toEmail,
            subject: subject,
            html: emailWrapper(contentWithUnsubscribe),
        });
    } catch (error) {
        console.error("Failed to send newsletter email:", error);
    }
};

// Send Captain Welcome Email (credentials)
export const sendCaptainWelcomeEmail = async (captain, plainPassword) => {
    try {
        const transporter = await createTransporter();
        const smtpSettings = await Smtp.findOne();

        const content = `
          <h2>Welcome to the Delivery Team, ${captain.name}!</h2>
          <p>You have been added as a delivery captain on Grocery Marketplace.</p>
          <p>Here are your login credentials for the captain portal:</p>
          <div style="margin: 20px 0; padding: 20px; background: #f4f7f6; border-radius: 8px; border-left: 4px solid #4CAF50;">
            <p style="margin: 8px 0;"><strong>Login URL:</strong> <a href="${process.env.FRONTEND_URL}/captain">${process.env.FRONTEND_URL}/captain</a></p>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${captain.email}</p>
            <p style="margin: 8px 0;"><strong>Password:</strong> <code style="background:#e8f5e9;padding:2px 6px;border-radius:4px;font-family:monospace;">${plainPassword}</code></p>
          </div>
          <p style="color:#888;font-size:13px;">Please log in and change your password after your first login.</p>
          <p>We're excited to have you on board! You will receive email notifications when a delivery is assigned to you.</p>
        `;

        await transporter.sendMail({
            from: `"${smtpSettings.fromEmail}" <${smtpSettings.user}>`,
            to: captain.email,
            subject: `Welcome to Grocery Marketplace - Captain Login Details`,
            html: emailWrapper(content),
        });
    } catch (error) {
        console.error("Failed to send captain welcome email:", error);
    }
};

// Send Order Assignment Notification to Captain
export const sendCaptainOrderNotification = async (captain, order, customer, address) => {
    try {
        const transporter = await createTransporter();
        const smtpSettings = await Smtp.findOne();

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

          <p style="margin-top:20px;">
            <a href="${process.env.FRONTEND_URL}/captain" class="btn">Go to Captain Portal</a>
          </p>
          <p style="color:#888;font-size:13px;">Please respond to this delivery request within a reasonable time.</p>
        `;

        await transporter.sendMail({
            from: `"${smtpSettings.fromEmail}" <${smtpSettings.user}>`,
            to: captain.email,
            subject: `New Delivery Assigned - Order #${order._id}`,
            html: emailWrapper(content),
        });
    } catch (error) {
        console.error("Failed to send captain order notification email:", error);
    }
};

// Send Order Rejected Email to Customer
export const sendOrderRejectedEmail = async (user, order) => {
    try {
        const transporter = await createTransporter();
        const smtpSettings = await Smtp.findOne();

        const content = `
          <h2>Order Update - #${order._id}</h2>
          <p>Hello ${user.name},</p>
          <p>We're sorry to inform you that your order <strong>#${order._id}</strong> could not be assigned to a delivery captain at this time.</p>
          <div style="margin:20px 0;padding:15px;background:#fff3f3;border-left:4px solid #F44336;border-radius:4px;">
            <h3 style="margin:0 0 8px 0;color:#F44336;">Status: Order Rejected</h3>
            <p style="margin:0;">Unfortunately, no captain was available to accept your delivery. Please contact support for assistance.</p>
          </div>
          <p>We sincerely apologize for the inconvenience. Our team will look into this.</p>
          <p><a href="${process.env.FRONTEND_URL}/profile/orders" class="btn">View My Orders</a></p>
        `;

        await transporter.sendMail({
            from: `"${smtpSettings.fromEmail}" <${smtpSettings.user}>`,
            to: user.email,
            subject: `Order Rejected - #${order._id}`,
            html: emailWrapper(content),
        });
    } catch (error) {
        console.error("Failed to send order rejected email:", error);
    }
};

// Send Delivery Confirmation Email with Review Links to Customer
export const sendDeliveryConfirmationEmail = async (user, order) => {
    try {
        const transporter = await createTransporter();
        const smtpSettings = await Smtp.findOne();

        // Build per-product star rating rows (5 individual ★ links)
        const items = (order.items || []).filter(i => i.product);
        const productReviewBlocks = items.map(item => {
            const product = item.product;
            const productId = product._id;
            const productName = product.name || "Product";

            // Each ★ is a separate link — clicking star N opens /review?rating=N&token=SIGNED_JWT
            // Token encodes productId + orderId + userId for secure no-login review submission
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

        await transporter.sendMail({
            from: `"${smtpSettings.fromEmail}" <${smtpSettings.user}>`,
            to: user.email,
            subject: `Order Delivered — Share Your Review! #${order._id}`,
            html: emailWrapper(content),
        });
    } catch (error) {
        console.error("Failed to send delivery confirmation email:", error);
    }
};




// Send Verification Email
export const sendVerificationEmail = async (toEmail, name, verificationToken) => {
    try {
        const transporter = await createTransporter();
        const smtpSettings = await Smtp.findOne();

        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

        const content = `
          <h2>Welcome to Grocery Marketplace, ${name}!</h2>
          <p>Thank you for registering. Please verify your email address to activate your account.</p>
          <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" class="btn" style="padding: 12px 24px; font-size: 16px;">Verify Email Address</a>
          </div>
          <p style="font-size: 14px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="font-size: 14px; word-break: break-all; color: #4CAF50;">${verificationUrl}</p>
          <p style="margin-top: 30px;">If you didn't create an account, you can safely ignore this email.</p>
      `;

        await transporter.sendMail({
            from: `"${smtpSettings.fromEmail}" <${smtpSettings.user}>`,
            to: toEmail,
            subject: "Verify Your Email Address",
            html: emailWrapper(content),
        });
    } catch (error) {
        console.error("Failed to send verification email:", error);
    }
};

