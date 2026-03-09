import nodemailer from "nodemailer";
import Smtp from "../models/smtp.model.js";

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
