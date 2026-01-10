import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Admin email for notifications
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@grunge-pallets.com';
const FROM_EMAIL = 'Grunge Pallets <onboarding@resend.dev>'; // Use Resend's test domain or your verified domain

interface EmailParams {
    to: string;
    subject: string;
    html: string;
}

async function sendEmail({ to, subject, html }: EmailParams) {
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject,
            html,
        });

        if (error) {
            console.error('Email send error:', error);
            return { success: false, error };
        }

        console.log('Email sent successfully:', data?.id);
        return { success: true, id: data?.id };
    } catch (error) {
        console.error('Email send exception:', error);
        return { success: false, error };
    }
}

// ==========================================
// EMAIL TEMPLATES
// ==========================================

const emailStyles = `
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
    .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
    .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
    .order-details { background: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-confirmed { background: #dbeafe; color: #1e40af; }
    .status-processing { background: #e9d5ff; color: #7c3aed; }
    .status-shipped { background: #cffafe; color: #0e7490; }
    .status-delivered { background: #d1fae5; color: #065f46; }
`;

function wrapEmail(content: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${emailStyles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🪵 Grunge Pallets</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>Grunge Pallets & Recycling</p>
            <p>Quality Pallets, Sustainable Solutions</p>
        </div>
    </div>
</body>
</html>
    `;
}

// ==========================================
// NOTIFICATION FUNCTIONS
// ==========================================

/**
 * Notify admin of new user signup
 */
export async function sendNewSignupNotification(user: {
    email: string;
    companyName: string;
    contactName: string;
}) {
    const content = `
        <h2>New User Signup</h2>
        <p>A new user has signed up and is awaiting approval:</p>
        <div class="order-details">
            <p><strong>Company:</strong> ${user.companyName}</p>
            <p><strong>Contact:</strong> ${user.contactName}</p>
            <p><strong>Email:</strong> ${user.email}</p>
        </div>
        <p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin" class="button">
                Review in Admin Panel
            </a>
        </p>
    `;

    return sendEmail({
        to: ADMIN_EMAIL,
        subject: `New Signup: ${user.companyName}`,
        html: wrapEmail(content),
    });
}

/**
 * Notify user their account has been approved
 */
export async function sendAccountApprovedEmail(user: {
    email: string;
    contactName: string;
    companyName: string;
}) {
    const content = `
        <h2>Welcome to Grunge Pallets! 🎉</h2>
        <p>Hi ${user.contactName},</p>
        <p>Great news! Your account for <strong>${user.companyName}</strong> has been approved.</p>
        <p>You now have full access to our wholesale ordering portal where you can:</p>
        <ul>
            <li>Browse our full product catalog</li>
            <li>Place orders 24/7</li>
            <li>Track your order history</li>
            <li>Request custom pallet quotes</li>
        </ul>
        <p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/portal" class="button">
                Start Shopping
            </a>
        </p>
    `;

    return sendEmail({
        to: user.email,
        subject: 'Your Grunge Pallets Account is Approved!',
        html: wrapEmail(content),
    });
}

/**
 * Send order confirmation to customer
 */
export async function sendOrderConfirmationEmail(order: {
    customerEmail: string;
    customerName: string;
    orderId: string;
    items: Array<{ name: string; quantity: number; price: number; isCustom?: boolean }>;
    total: number;
    hasCustomItems: boolean;
}) {
    const orderRef = order.orderId.split('-')[0].toUpperCase();

    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
                ${item.name}
                ${item.isCustom ? '<span style="background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 5px;">Custom</span>' : ''}
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">
                ${item.isCustom && item.price === 0 ? 'TBD' : `$${item.price.toFixed(2)}`}
            </td>
        </tr>
    `).join('');

    const content = `
        <h2>Order Confirmed! 📦</h2>
        <p>Hi ${order.customerName},</p>
        <p>Thank you for your order. We've received it and will process it shortly.</p>
        
        <div class="order-details">
            <p><strong>Order #:</strong> ${orderRef}</p>
            ${order.hasCustomItems ? '<p style="color: #d97706;"><strong>Note:</strong> Your order contains custom items. We will contact you with pricing shortly.</p>' : ''}
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <thead>
                <tr style="background: #f3f4f6;">
                    <th style="padding: 8px; text-align: left;">Item</th>
                    <th style="padding: 8px; text-align: center;">Qty</th>
                    <th style="padding: 8px; text-align: right;">Price</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="2" style="padding: 8px; text-align: right; font-weight: bold;">Total:</td>
                    <td style="padding: 8px; text-align: right; font-weight: bold;">
                        ${order.hasCustomItems ? 'TBD' : `$${order.total.toFixed(2)}`}
                    </td>
                </tr>
            </tfoot>
        </table>
        
        <p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/portal/orders" class="button">
                View Order
            </a>
        </p>
    `;

    return sendEmail({
        to: order.customerEmail,
        subject: `Order Confirmed #${orderRef}`,
        html: wrapEmail(content),
    });
}

/**
 * Notify admin of new order
 */
export async function sendNewOrderNotificationToAdmin(order: {
    orderId: string;
    companyName: string;
    customerEmail: string;
    total: number;
    itemCount: number;
    hasCustomItems: boolean;
}) {
    const orderRef = order.orderId.split('-')[0].toUpperCase();

    const content = `
        <h2>New Order Received! 🛒</h2>
        <div class="order-details">
            <p><strong>Order #:</strong> ${orderRef}</p>
            <p><strong>Customer:</strong> ${order.companyName}</p>
            <p><strong>Email:</strong> ${order.customerEmail}</p>
            <p><strong>Items:</strong> ${order.itemCount}</p>
            <p><strong>Total:</strong> ${order.hasCustomItems ? 'Contains custom items (TBD)' : `$${order.total.toFixed(2)}`}</p>
            ${order.hasCustomItems ? '<p style="color: #d97706;"><strong>⚠️ Action Required:</strong> Custom items need pricing</p>' : ''}
        </div>
        <p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin" class="button">
                View in Admin Panel
            </a>
        </p>
    `;

    return sendEmail({
        to: ADMIN_EMAIL,
        subject: `New Order #${orderRef} from ${order.companyName}${order.hasCustomItems ? ' [Custom Items]' : ''}`,
        html: wrapEmail(content),
    });
}

/**
 * Notify customer of order status change
 */
export async function sendOrderStatusUpdateEmail(order: {
    customerEmail: string;
    customerName: string;
    orderId: string;
    status: string;
    deliveryDate?: string | null;
}) {
    const orderRef = order.orderId.split('-')[0].toUpperCase();

    const statusMessages: Record<string, string> = {
        confirmed: 'Your order has been confirmed and is being prepared.',
        processing: 'Your order is now being processed.',
        shipped: 'Your order has been shipped and is on its way!',
        delivered: 'Your order has been delivered. Thank you for your business!',
        cancelled: 'Your order has been cancelled. Please contact us if you have questions.',
    };

    const statusColors: Record<string, string> = {
        confirmed: 'status-confirmed',
        processing: 'status-processing',
        shipped: 'status-shipped',
        delivered: 'status-delivered',
        cancelled: 'status-pending',
    };

    const content = `
        <h2>Order Status Update</h2>
        <p>Hi ${order.customerName},</p>
        
        <div class="order-details">
            <p><strong>Order #:</strong> ${orderRef}</p>
            <p><strong>Status:</strong> <span class="status-badge ${statusColors[order.status] || ''}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></p>
            ${order.deliveryDate ? `<p><strong>Expected Delivery:</strong> ${new Date(order.deliveryDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>` : ''}
        </div>
        
        <p>${statusMessages[order.status] || 'Your order status has been updated.'}</p>
        
        <p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/portal/orders" class="button">
                View Order Details
            </a>
        </p>
    `;

    return sendEmail({
        to: order.customerEmail,
        subject: `Order #${orderRef} - ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`,
        html: wrapEmail(content),
    });
}

/**
 * Notify customer when custom pallet price is set
 */
export async function sendCustomPriceSetEmail(data: {
    customerEmail: string;
    customerName: string;
    orderId: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    newOrderTotal: number;
}) {
    const orderRef = data.orderId.split('-')[0].toUpperCase();

    const content = `
        <h2>Custom Pallet Quote Ready 💰</h2>
        <p>Hi ${data.customerName},</p>
        <p>We've reviewed your custom pallet request and have finalized the pricing:</p>
        
        <div class="order-details">
            <p><strong>Order #:</strong> ${orderRef}</p>
            <p><strong>Item:</strong> ${data.itemName}</p>
            <p><strong>Quantity:</strong> ${data.quantity}</p>
            <p><strong>Unit Price:</strong> $${data.unitPrice.toFixed(2)}</p>
            <p><strong>Line Total:</strong> $${data.lineTotal.toFixed(2)}</p>
        </div>
        
        <p style="font-size: 18px;"><strong>New Order Total: $${data.newOrderTotal.toFixed(2)}</strong></p>
        
        <p>Your order will now proceed to fulfillment. If you have any questions about this pricing, please contact us.</p>
        
        <p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/portal/orders" class="button">
                View Order
            </a>
        </p>
    `;

    return sendEmail({
        to: data.customerEmail,
        subject: `Custom Quote Ready - Order #${orderRef}`,
        html: wrapEmail(content),
    });
}
