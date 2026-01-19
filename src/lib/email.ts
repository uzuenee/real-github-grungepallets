import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';

// Lazy initialization to avoid build-time errors
let resendClient: Resend | null = null;
function getResendClient(): Resend {
    if (!resendClient) {
        resendClient = new Resend(process.env.RESEND_API_KEY);
    }
    return resendClient;
}

function getAdminEmail(): string {
    return process.env.ADMIN_EMAIL || '';
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Grunge Pallets <onboarding@resend.dev>';

interface EmailResult {
    success: boolean;
    error?: string;
}

interface NotificationPreferences {
    order_confirmations: boolean;
    shipping_updates: boolean;
    delivery_notifications: boolean;
    promotional_emails: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
    order_confirmations: true,
    shipping_updates: true,
    delivery_notifications: true,
    promotional_emails: false,
};

// Fetch user's notification preferences
async function getUserNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    try {
        const supabase = await createClient();
        const { data } = await supabase
            .from('profiles')
            .select('notification_preferences')
            .eq('id', userId)
            .single();

        return data?.notification_preferences || DEFAULT_PREFERENCES;
    } catch (err) {
        console.error('[Email] Failed to fetch preferences:', err);
        return DEFAULT_PREFERENCES;
    }
}

// Base send email function
async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}): Promise<EmailResult> {
    if (!process.env.RESEND_API_KEY) {
        console.warn('[Email] RESEND_API_KEY not configured, skipping email');
        return { success: false, error: 'Email not configured' };
    }

    try {
        const { error } = await getResendClient().emails.send({
            from: FROM_EMAIL,
            to,
            subject,
            html,
        });

        if (error) {
            console.error('[Email] Send failed:', error);
            return { success: false, error: error.message };
        }

        console.log(`[Email] Sent to ${to}: ${subject}`);
        return { success: true };
    } catch (err) {
        console.error('[Email] Unexpected error:', err);
        return { success: false, error: String(err) };
    }
}

// Email wrapper with base template
function wrapInTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: #1a1a2e; padding: 24px; text-align: center; }
        .header h1 { color: #f59e0b; margin: 0; font-size: 24px; }
        .content { padding: 32px 24px; }
        .footer { background: #f8f9fa; padding: 24px; text-align: center; font-size: 14px; color: #666; }
        .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
        .status-badge { display: inline-block; padding: 6px 12px; border-radius: 4px; font-weight: 600; text-transform: capitalize; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-confirmed { background: #dbeafe; color: #1e40af; }
        .status-processing { background: #e0e7ff; color: #3730a3; }
        .status-shipped { background: #d1fae5; color: #065f46; }
        .status-delivered { background: #d1fae5; color: #065f46; }
        .status-cancelled { background: #fee2e2; color: #991b1b; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f9fafb; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Grunge Pallets</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>Grunge Pallets & Recycling Services</p>
            <p>1234 Industrial Blvd, Atlanta, GA 30318</p>
            <p>(404) 555-7255 | info@grungepallets.com</p>
        </div>
    </div>
</body>
</html>`;
}

// Order confirmation email to customer
export async function sendOrderConfirmation({
    userId,
    customerEmail,
    customerName,
    orderId,
    orderTotal,
    items,
}: {
    userId: string;
    customerEmail: string;
    customerName: string;
    orderId: string;
    orderTotal: number;
    items: Array<{ product_name: string; quantity: number; unit_price: number }>;
}): Promise<EmailResult> {
    // Check user preferences
    const prefs = await getUserNotificationPreferences(userId);
    if (!prefs.order_confirmations) {
        console.log(`[Email] User ${userId} has order_confirmations disabled, skipping`);
        return { success: true }; // Return success since this is expected behavior
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const itemsHtml = items.map(item => `
        <tr>
            <td>${item.product_name}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">$${item.unit_price.toFixed(2)}</td>
        </tr>
    `).join('');

    const html = wrapInTemplate(`
        <h2>Order Confirmed!</h2>
        <p>Hi ${customerName},</p>
        <p>Thank you for your order. We've received it and will begin processing shortly.</p>
        
        <p><strong>Order #:</strong> ${orderId.slice(0, 8).toUpperCase()}</p>
        
        <table>
            <thead>
                <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Price</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="2" style="text-align: right; font-weight: 600;">Total:</td>
                    <td style="text-align: right; font-weight: 600;">$${orderTotal.toFixed(2)}</td>
                </tr>
            </tfoot>
        </table>
        
        <p style="text-align: center; margin-top: 32px;">
            <a href="${siteUrl}/portal/orders/${orderId}" class="button">View Order Details</a>
        </p>
        
        <p style="margin-top: 32px;">If you have any questions, reply to this email or call us at (404) 555-7255.</p>
    `);

    return sendEmail({
        to: customerEmail,
        subject: `Order Confirmed - #${orderId.slice(0, 8).toUpperCase()}`,
        html,
    });
}

// Order status update email to customer
export async function sendOrderStatusUpdate({
    userId,
    customerEmail,
    customerName,
    orderId,
    newStatus,
    deliveryDate,
    items,
    orderTotal,
}: {
    userId: string;
    customerEmail: string;
    customerName: string;
    orderId: string;
    newStatus: string;
    deliveryDate?: string;
    items?: Array<{ product_name: string; quantity: number; unit_price: number }>;
    orderTotal?: number;
}): Promise<EmailResult> {
    // Check user preferences - shipping_updates covers status changes
    const prefs = await getUserNotificationPreferences(userId);

    // Determine which preference applies based on status
    const isDeliveryNotification = newStatus === 'delivered';
    const isShippingUpdate = ['shipped', 'processing', 'confirmed'].includes(newStatus);

    if (isDeliveryNotification && !prefs.delivery_notifications) {
        console.log(`[Email] User ${userId} has delivery_notifications disabled, skipping`);
        return { success: true };
    }
    if (isShippingUpdate && !prefs.shipping_updates) {
        console.log(`[Email] User ${userId} has shipping_updates disabled, skipping`);
        return { success: true };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const statusMessages: Record<string, string> = {
        confirmed: 'Your order has been confirmed and is being prepared.',
        processing: 'Your order is now being processed and will ship soon.',
        shipped: 'Great news! Your order has been shipped.',
        delivered: 'Your order has been delivered. Thank you for your business!',
        cancelled: 'Your order has been cancelled. If you have any questions, please contact us.',
    };

    const message = statusMessages[newStatus] || `Your order status has been updated to: ${newStatus}`;

    // Build items table if items are provided
    const itemsHtml = items && items.length > 0 ? `
        <table>
            <thead>
                <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Price</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr>
                        <td>${item.product_name}</td>
                        <td style="text-align: center;">${item.quantity}</td>
                        <td style="text-align: right;">$${item.unit_price.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
            ${orderTotal ? `
            <tfoot>
                <tr>
                    <td colspan="2" style="text-align: right; font-weight: 600;">Total:</td>
                    <td style="text-align: right; font-weight: 600;">$${orderTotal.toFixed(2)}</td>
                </tr>
            </tfoot>
            ` : ''}
        </table>
    ` : '';

    const html = wrapInTemplate(`
        <h2>Order Status Changed</h2>
        <p>Hi ${customerName},</p>
        <p>${message}</p>
        
        <p><strong>Order #:</strong> ${orderId.slice(0, 8).toUpperCase()}</p>
        <p><strong>New Status:</strong> <span class="status-badge status-${newStatus}">${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</span></p>
        ${deliveryDate ? `<p><strong>Delivery Date:</strong> ${new Date(deliveryDate).toLocaleDateString()}</p>` : ''}
        
        ${itemsHtml}
        
        <p style="text-align: center; margin-top: 32px;">
            <a href="${siteUrl}/portal/orders/${orderId}" class="button">View Order Details</a>
        </p>
    `);

    return sendEmail({
        to: customerEmail,
        subject: `Order Status Changed - #${orderId.slice(0, 8).toUpperCase()}`,
        html,
    });
}

// User approved email
export async function sendUserApprovedEmail({
    userEmail,
    userName,
    companyName,
}: {
    userEmail: string;
    userName: string;
    companyName: string;
}): Promise<EmailResult> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const html = wrapInTemplate(`
        <h2>Account Approved!</h2>
        <p>Hi ${userName},</p>
        <p>Great news! Your account for <strong>${companyName}</strong> has been approved.</p>
        <p>You can now access the client portal to browse products, place orders, and manage your account.</p>
        
        <p style="text-align: center; margin-top: 32px;">
            <a href="${siteUrl}/login" class="button">Log In to Portal</a>
        </p>
        
        <p style="margin-top: 32px;">Welcome to Grunge Pallets! We look forward to serving your pallet needs.</p>
    `);

    return sendEmail({
        to: userEmail,
        subject: 'Your Account Has Been Approved - Grunge Pallets',
        html,
    });
}

// Admin notification for new orders
export async function sendAdminNewOrderNotification({
    orderId,
    customerName,
    companyName,
    orderTotal,
    items,
}: {
    orderId: string;
    customerName: string;
    companyName: string;
    orderTotal: number;
    items: Array<{ product_name: string; quantity: number; unit_price: number }>;
}): Promise<EmailResult> {
    if (!getAdminEmail()) {
        console.warn('[Email] getAdminEmail() not configured, skipping admin notification');
        return { success: false, error: 'Admin email not configured' };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Build items table
    const itemsHtml = items.map(item => `
        <tr>
            <td>${item.product_name}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">$${item.unit_price.toFixed(2)}</td>
        </tr>
    `).join('');

    const html = wrapInTemplate(`
        <h2>New Order Received</h2>
        <p>A new order has been placed:</p>
        
        <table>
            <tr><td><strong>Order #:</strong></td><td>${orderId.slice(0, 8).toUpperCase()}</td></tr>
            <tr><td><strong>Customer:</strong></td><td>${customerName}</td></tr>
            <tr><td><strong>Company:</strong></td><td>${companyName}</td></tr>
        </table>

        <h3 style="margin-top: 24px;">Order Items</h3>
        <table>
            <thead>
                <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Price</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="2" style="text-align: right; font-weight: 600;">Total:</td>
                    <td style="text-align: right; font-weight: 600;">$${orderTotal.toFixed(2)}</td>
                </tr>
            </tfoot>
        </table>
        
        <p style="text-align: center; margin-top: 32px;">
            <a href="${siteUrl}/admin/orders/${orderId}" class="button">View Order</a>
        </p>
    `);

    return sendEmail({
        to: getAdminEmail(),
        subject: `New Order #${orderId.slice(0, 8).toUpperCase()} - $${orderTotal.toFixed(2)}`,
        html,
    });
}

// Admin notification for new user signup
export async function sendAdminNewUserNotification({
    userName,
    userEmail,
    companyName,
}: {
    userName: string;
    userEmail: string;
    companyName: string;
}): Promise<EmailResult> {
    if (!getAdminEmail()) {
        console.warn('[Email] getAdminEmail() not configured, skipping admin notification');
        return { success: false, error: 'Admin email not configured' };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const html = wrapInTemplate(`
        <h2>New User Registration</h2>
        <p>A new user has signed up and is awaiting approval:</p>
        
        <table>
            <tr><td><strong>Name:</strong></td><td>${userName}</td></tr>
            <tr><td><strong>Email:</strong></td><td>${userEmail}</td></tr>
            <tr><td><strong>Company:</strong></td><td>${companyName}</td></tr>
        </table>
        
        <p style="text-align: center; margin-top: 32px;">
            <a href="${siteUrl}/admin" class="button">Review in Admin Panel</a>
        </p>
    `);

    return sendEmail({
        to: getAdminEmail(),
        subject: `New User Registration - ${companyName}`,
        html,
    });
}

// Admin notification for contact form
export async function sendAdminContactNotification({
    name,
    email,
    company,
    phone,
    message,
}: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
    message: string;
}): Promise<EmailResult> {
    if (!getAdminEmail()) {
        console.warn('[Email] getAdminEmail() not configured, skipping admin notification');
        return { success: false, error: 'Admin email not configured' };
    }

    const html = wrapInTemplate(`
        <h2>New Contact Form Submission</h2>
        
        <table>
            <tr><td><strong>Name:</strong></td><td>${name}</td></tr>
            <tr><td><strong>Email:</strong></td><td><a href="mailto:${email}">${email}</a></td></tr>
            ${company ? `<tr><td><strong>Company:</strong></td><td>${company}</td></tr>` : ''}
            ${phone ? `<tr><td><strong>Phone:</strong></td><td>${phone}</td></tr>` : ''}
        </table>
        
        <h3>Message:</h3>
        <p style="background: #f9fafb; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${message}</p>
        
        <p style="margin-top: 24px;">
            <a href="mailto:${email}" class="button">Reply to ${name}</a>
        </p>
    `);

    return sendEmail({
        to: getAdminEmail(),
        subject: `Contact Form: ${name}${company ? ` - ${company}` : ''}`,
        html,
    });
}

// Admin notification for quote request
export async function sendAdminQuoteNotification({
    type,
    name,
    email,
    company,
    phone,
    details,
}: {
    type: 'buy' | 'sell';
    name: string;
    email: string;
    company?: string;
    phone?: string;
    details: Record<string, string>;
}): Promise<EmailResult> {
    if (!getAdminEmail()) {
        console.warn('[Email] getAdminEmail() not configured, skipping admin notification');
        return { success: false, error: 'Admin email not configured' };
    }

    const detailsHtml = Object.entries(details)
        .filter(([, value]) => value)
        .map(([key, value]) => `<tr><td><strong>${key}:</strong></td><td>${value}</td></tr>`)
        .join('');

    const html = wrapInTemplate(`
        <h2>New Quote Request - ${type === 'buy' ? 'Buy Pallets' : 'Sell Pallets'}</h2>
        
        <h3>Contact Information</h3>
        <table>
            <tr><td><strong>Name:</strong></td><td>${name}</td></tr>
            <tr><td><strong>Email:</strong></td><td><a href="mailto:${email}">${email}</a></td></tr>
            ${company ? `<tr><td><strong>Company:</strong></td><td>${company}</td></tr>` : ''}
            ${phone ? `<tr><td><strong>Phone:</strong></td><td>${phone}</td></tr>` : ''}
        </table>
        
        <h3>Request Details</h3>
        <table>
            ${detailsHtml}
        </table>
        
        <p style="margin-top: 24px;">
            <a href="mailto:${email}" class="button">Reply to ${name}</a>
        </p>
    `);

    return sendEmail({
        to: getAdminEmail(),
        subject: `Quote Request: ${type === 'buy' ? 'Buy' : 'Sell'} - ${name}${company ? ` (${company})` : ''}`,
        html,
    });
}
