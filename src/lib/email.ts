import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';
import { escapeHtml } from '@/lib/security/escapeHtml';

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

function sanitizeEmailHeader(value: string): string {
    return value.replace(/[\r\n]+/g, ' ').trim();
}

function safeHtml(value: unknown): string {
    return escapeHtml(String(value ?? ''));
}

function estimateBase64DecodedBytes(base64: string): number {
    const sanitized = base64.trim().replace(/\s+/g, '');
    if (!sanitized) return 0;

    const padding = sanitized.endsWith('==') ? 2 : sanitized.endsWith('=') ? 1 : 0;
    return Math.floor((sanitized.length * 3) / 4) - padding;
}

function formatMoney(value: number): string {
    try {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    } catch {
        return `$${value.toFixed(2)}`;
    }
}

function formatShortDate(value: string): string {
    try {
        return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
        return value;
    }
}

function renderOrderPricingTable({
    items,
    orderTotal,
    deliveryPrice,
}: {
    items: Array<{ product_name: string; quantity: number; unit_price: number }>;
    orderTotal?: number;
    deliveryPrice?: number | null;
}): { subtotal: number; html: string } {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

    let effectiveDeliveryPrice: number | null | undefined = deliveryPrice;
    if (effectiveDeliveryPrice === undefined && typeof orderTotal === 'number') {
        const derived = orderTotal - subtotal;
        effectiveDeliveryPrice = Number.isFinite(derived) ? derived : undefined;
    }

    const rows = items.map((item) => `
        <tr>
            <td>${safeHtml(item.product_name)}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">${formatMoney(item.unit_price)}</td>
            <td style="text-align: right;">${formatMoney(item.quantity * item.unit_price)}</td>
        </tr>
    `).join('');

    const html = `
        <table>
            <thead>
                <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Unit</th>
                    <th style="text-align: right;">Line Total</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3" style="text-align: right; font-weight: 600;">Subtotal:</td>
                    <td style="text-align: right; font-weight: 600;">${formatMoney(subtotal)}</td>
                </tr>
                ${effectiveDeliveryPrice != null ? `
                <tr>
                    <td colspan="3" style="text-align: right; font-weight: 600;">Delivery:</td>
                    <td style="text-align: right; font-weight: 600;">${formatMoney(effectiveDeliveryPrice)}</td>
                </tr>
                ` : ''}
                ${typeof orderTotal === 'number' ? `
                <tr>
                    <td colspan="3" style="text-align: right; font-weight: 700;">Total:</td>
                    <td style="text-align: right; font-weight: 700;">${formatMoney(orderTotal)}</td>
                </tr>
                ` : ''}
            </tfoot>
        </table>
    `;

    return { subtotal, html };
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

// Attachment type for Resend
interface EmailAttachment {
    filename: string;
    content: string; // base64 content without data URL prefix
}

// Base send email function
async function sendEmail({
    to,
    subject,
    html,
    attachments = [],
}: {
    to: string;
    subject: string;
    html: string;
    attachments?: EmailAttachment[];
}): Promise<EmailResult> {
    if (!process.env.RESEND_API_KEY) {
        console.warn('[Email] RESEND_API_KEY not configured, skipping email');
        return { success: false, error: 'Email not configured' };
    }

    try {
        const safeTo = sanitizeEmailHeader(to);
        const safeSubject = sanitizeEmailHeader(subject);
        const safeFrom = sanitizeEmailHeader(FROM_EMAIL);

        const emailOptions: {
            from: string;
            to: string;
            subject: string;
            html: string;
            attachments?: { filename: string; content: Buffer }[];
        } = {
            from: safeFrom,
            to: safeTo,
            subject: safeSubject,
            html,
        };

        // Add attachments if present
        if (attachments.length > 0) {
            const MAX_ATTACHMENTS = 3;
            const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

            const safeAttachments = attachments
                .slice(0, MAX_ATTACHMENTS)
                .filter((att) => estimateBase64DecodedBytes(att.content) <= MAX_ATTACHMENT_BYTES);

            emailOptions.attachments = safeAttachments.map((att, i) => ({
                filename: sanitizeEmailHeader(att.filename || `photo_${i + 1}.jpg`),
                content: Buffer.from(att.content, 'base64'),
            }));
        }

        const { error } = await getResendClient().emails.send(emailOptions);

        if (error) {
            console.error('[Email] Send failed:', error);
            return { success: false, error: error.message };
        }

        if (process.env.NODE_ENV !== 'production') {
            console.log(`[Email] Sent to ${safeTo}: ${safeSubject}`);
        }
        return { success: true };
    } catch (err) {
        console.error('[Email] Unexpected error:', err);
        return { success: false, error: String(err) };
    }
}

// Email wrapper with base template
function wrapInTemplate(content: string): string {
    const logoUrl = process.env.EMAIL_LOGO_URL || 'https://grungepallets.com/logo.jpg';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Outfit, Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1A1A1A;
            margin: 0;
            padding: 0;
            background-color: #F5F5F5;
        }
        .container {
            max-width: 640px;
            margin: 24px auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #E0E0E0;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }
        .header {
            background: #1A1A1A;
            padding: 22px 24px;
            text-align: center;
            border-bottom: 4px solid #FF6600;
        }
        .header img { max-height: 44px; width: auto; }
        .content { padding: 32px 24px; }
        .content h2 { margin: 0 0 12px 0; font-family: Inter, Outfit, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; letter-spacing: 0.2px; }
        .content h3 { margin: 22px 0 10px 0; font-family: Inter, Outfit, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .content p { margin: 0 0 14px 0; color: #4D4D4D; }
        .content a { color: #FF6600; }
        .footer { background: #F5F5F5; padding: 22px 24px; text-align: center; font-size: 13px; color: #4D4D4D; }
        .footer p { margin: 6px 0; }
        .button {
            display: inline-block;
            background: #FF6600;
            color: #ffffff !important;
            padding: 12px 20px;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 700;
            border: 1px solid #CC5200;
            box-shadow: 0 6px 16px rgba(255, 102, 0, 0.25);
        }
        .status-badge { display: inline-block; padding: 6px 10px; border-radius: 999px; font-weight: 700; text-transform: capitalize; font-size: 12px; }
        .status-pending { background: #FFF3EB; color: #993D00; border: 1px solid #FFC299; }
        .status-confirmed { background: #E0E0E0; color: #1A1A1A; border: 1px solid #B3B3B3; }
        .status-processing { background: #FFE2CC; color: #662900; border: 1px solid #FFC299; }
        .status-shipped { background: #E6F4EA; color: #1B5E20; border: 1px solid #B7E1C1; }
        .status-delivered { background: #E6F4EA; color: #1B5E20; border: 1px solid #B7E1C1; }
        .status-cancelled { background: #FDE8E8; color: #8A1C1C; border: 1px solid #F5B8B8; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #E0E0E0; border-radius: 12px; overflow: hidden; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #E0E0E0; }
        th { background: #FFF3EB; font-weight: 700; color: #1A1A1A; }
        tfoot td { border-bottom: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${logoUrl}" alt="Grunge Pallets" />
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>Grunge Pallets & Recycling Services</p>
            <p>1925 Jason Industrial Parkway, Winston, GA 30187</p>
            <p>(770) 934-8248 | info@grungepallets.com</p>
        </div>
    </div>
</body>
</html>`;
}

// Order confirmation email to customer
export async function sendOrderConfirmation({
    userId: _userId,
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
    // Order confirmations are mandatory - no preference check needed
    void _userId;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const { html: pricingTableHtml } = renderOrderPricingTable({ items, orderTotal });

    const html = wrapInTemplate(`
        <h2>Order Received</h2>
        <p>Hi ${safeHtml(customerName)},</p>
        <p>Thanks for your order. We&apos;ve received it and will review it shortly.</p>
        
        <p><strong>Order #:</strong> ${orderId.slice(0, 8).toUpperCase()}</p>
        
        ${pricingTableHtml}
        
        <p style="text-align: center; margin-top: 32px;">
            <a href="${siteUrl}/portal/orders/${orderId}" class="button">View Order Details</a>
        </p>
        
        <p style="margin-top: 32px;">If you have any questions, reply to this email or call us at (770) 934-8248.</p>
    `);

    return sendEmail({
        to: customerEmail,
        subject: `Order Received - #${orderId.slice(0, 8).toUpperCase()}`,
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
    deliveryPrice,
}: {
    userId: string;
    customerEmail: string;
    customerName: string;
    orderId: string;
    newStatus: string;
    deliveryDate?: string;
    items?: Array<{ product_name: string; quantity: number; unit_price: number }>;
    orderTotal?: number;
    deliveryPrice?: number | null;
}): Promise<EmailResult> {
    // Check user preferences - shipping_updates covers status changes
    const prefs = await getUserNotificationPreferences(userId);

    // Determine which preference applies based on status
    const isDeliveryNotification = newStatus === 'delivered';
    const isShippingUpdate = ['shipped', 'processing', 'confirmed'].includes(newStatus);

    if (isDeliveryNotification && !prefs.delivery_notifications) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[Email] User ${userId} has delivery_notifications disabled, skipping`);
        }
        return { success: true };
    }
    if (isShippingUpdate && !prefs.shipping_updates) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[Email] User ${userId} has shipping_updates disabled, skipping`);
        }
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
    const safeStatusClass = /^[a-z-]+$/.test(newStatus) ? newStatus : 'unknown';
    const safeStatusLabel = safeHtml(newStatus.charAt(0).toUpperCase() + newStatus.slice(1));

    // Build items table if items are provided
    const itemsHtml = items && items.length > 0
        ? renderOrderPricingTable({ items, orderTotal, deliveryPrice }).html
        : '';

    const html = wrapInTemplate(`
        <h2>Order Status Changed</h2>
        <p>Hi ${safeHtml(customerName)},</p>
        <p>${safeHtml(message)}</p>
        
        <p><strong>Order #:</strong> ${orderId.slice(0, 8).toUpperCase()}</p>
        <p><strong>New Status:</strong> <span class="status-badge status-${safeStatusClass}">${safeStatusLabel}</span></p>
        ${deliveryDate ? `<p><strong>Delivery Date:</strong> ${formatShortDate(deliveryDate)}</p>` : ''}
        
        ${itemsHtml}
        
        <p style="text-align: center; margin-top: 32px;">
            <a href="${siteUrl}/portal/orders/${orderId}" class="button">View Order Details</a>
        </p>
    `);

    return sendEmail({
        to: customerEmail,
        subject: `Order Update: ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} - #${orderId.slice(0, 8).toUpperCase()}`,
        html,
    });
}

export async function sendOrderDetailsUpdated({
    userId: _userId,
    customerEmail,
    customerName,
    orderId,
    updates,
    deliveryDate,
    items,
    orderTotal,
    deliveryPrice,
}: {
    userId: string;
    customerEmail: string;
    customerName: string;
    orderId: string;
    updates: string[];
    deliveryDate?: string;
    items?: Array<{ product_name: string; quantity: number; unit_price: number }>;
    orderTotal?: number;
    deliveryPrice?: number | null;
}): Promise<EmailResult> {
    // Pricing / schedule updates are important - do not gate on preferences.
    void _userId;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const updatesHtml = updates.length > 0
        ? `<ul style="padding-left: 20px; margin: 12px 0;">${updates.map(u => `<li style="margin: 6px 0;">${u}</li>`).join('')}</ul>`
        : '';

    const itemsHtml = items && items.length > 0
        ? renderOrderPricingTable({ items, orderTotal, deliveryPrice }).html
        : '';

    const html = wrapInTemplate(`
        <h2>Order Updated</h2>
        <p>Hi ${safeHtml(customerName)},</p>
        <p>We&apos;ve updated your order details:</p>
        ${updatesHtml}

        <p><strong>Order #:</strong> ${orderId.slice(0, 8).toUpperCase()}</p>
        ${deliveryDate ? `<p><strong>Delivery Date:</strong> ${formatShortDate(deliveryDate)}</p>` : ''}

        ${itemsHtml}

        <p style="text-align: center; margin-top: 32px;">
            <a href="${siteUrl}/portal/orders/${orderId}" class="button">View Order Details</a>
        </p>
    `);

    return sendEmail({
        to: customerEmail,
        subject: `Order Updated - #${orderId.slice(0, 8).toUpperCase()}`,
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
            <tr><td><strong>Name:</strong></td><td>${safeHtml(name)}</td></tr>
            <tr><td><strong>Email:</strong></td><td><a href="mailto:${safeHtml(email)}">${safeHtml(email)}</a></td></tr>
            ${company ? `<tr><td><strong>Company:</strong></td><td>${safeHtml(company)}</td></tr>` : ''}
            ${phone ? `<tr><td><strong>Phone:</strong></td><td>${safeHtml(phone)}</td></tr>` : ''}
        </table>
        
        <h3>Message:</h3>
        <p style="background: #f9fafb; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${safeHtml(message)}</p>
        
        <p style="margin-top: 24px;">
            <a href="mailto:${safeHtml(email)}" class="button">Reply to ${safeHtml(name)}</a>
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
    photos = [],
}: {
    type: 'buy' | 'sell';
    name: string;
    email: string;
    company?: string;
    phone?: string;
    details: Record<string, string>;
    photos?: string[];
}): Promise<EmailResult> {
    if (!getAdminEmail()) {
        console.warn('[Email] getAdminEmail() not configured, skipping admin notification');
        return { success: false, error: 'Admin email not configured' };
    }

    const detailsHtml = Object.entries(details)
        .filter(([, value]) => value)
        .map(([key, value]) => `<tr><td><strong>${safeHtml(key)}:</strong></td><td>${safeHtml(value)}</td></tr>`)
        .join('');

    // Convert base64 data URLs to attachments
    const attachments: EmailAttachment[] = photos.slice(0, 3).map((photo, i) => {
        // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
        const base64Content = photo.includes(',') ? photo.split(',')[1] : photo;
        return {
            filename: `pallet_photo_${i + 1}.jpg`,
            content: base64Content,
        };
    });

    // Note about attached photos in email body
    const photosHtml = photos.length > 0 ? `
        <h3>Attached Photos</h3>
        <p style="color: #666; font-size: 14px;">
            📎 ${photos.length} photo${photos.length > 1 ? 's' : ''} attached to this email. 
            Please see attachments below.
        </p>
    ` : '';

    const emailTitle = type === 'buy' ? 'New Quote Request - Buy Pallets' : 'Pallet Pickup Requested';

    const html = wrapInTemplate(`
        <h2>${emailTitle}</h2>
        
        <h3>Contact Information</h3>
        <table>
            <tr><td><strong>Name:</strong></td><td>${safeHtml(name)}</td></tr>
            <tr><td><strong>Email:</strong></td><td><a href="mailto:${safeHtml(email)}">${safeHtml(email)}</a></td></tr>
            ${company ? `<tr><td><strong>Company:</strong></td><td>${safeHtml(company)}</td></tr>` : ''}
            ${phone ? `<tr><td><strong>Phone:</strong></td><td>${safeHtml(phone)}</td></tr>` : ''}
        </table>
        
        <h3>Request Details</h3>
        <table>
            ${detailsHtml}
        </table>
        
        ${photosHtml}
        
        <p style="margin-top: 24px;">
            <a href="mailto:${safeHtml(email)}" class="button">Reply to ${safeHtml(name)}</a>
        </p>
    `);

    const subject = type === 'buy'
        ? `Quote Request - ${name}${company ? ` (${company})` : ''}`
        : `Pallet Pickup Requested - ${name}${company ? ` (${company})` : ''}`;

    return sendEmail({
        to: getAdminEmail(),
        subject,
        html,
        attachments,
    });
}

// =====================================
// PICKUP REQUEST EMAILS
// =====================================

const conditionLabels: Record<string, string> = {
    'grade-a': 'Grade A (Like new)',
    'grade-b': 'Grade B (Good condition)',
    'mixed': 'Mixed conditions',
    'damaged': 'Damaged/Broken',
};

// Send pickup confirmation to customer
export async function sendPickupConfirmationEmail({
    customerEmail,
    customerName,
    pickupId,
    palletCondition,
    estimatedQuantity,
    pickupAddress,
    preferredDate,
}: {
    customerEmail: string;
    customerName: string;
    pickupId: string;
    palletCondition: string;
    estimatedQuantity: number;
    pickupAddress: string;
    preferredDate?: string;
}): Promise<EmailResult> {
    // Pickup confirmations are mandatory - no preference check needed

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const html = wrapInTemplate(`
        <h2>Pickup Request Received!</h2>
        <p>Hi ${safeHtml(customerName)},</p>
        <p>We've received your pallet pickup request and will review it shortly.</p>
        
        <h3>Request Details</h3>
        <table>
            <tr><td><strong>Request ID:</strong></td><td>${pickupId.slice(0, 8).toUpperCase()}</td></tr>
            <tr><td><strong>Pallet Condition:</strong></td><td>${safeHtml(conditionLabels[palletCondition] || palletCondition)}</td></tr>
            <tr><td><strong>Estimated Quantity:</strong></td><td>${estimatedQuantity} pallets</td></tr>
            <tr><td><strong>Pickup Address:</strong></td><td>${safeHtml(pickupAddress)}</td></tr>
            ${preferredDate ? `<tr><td><strong>Preferred Date:</strong></td><td>${new Date(preferredDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</td></tr>` : ''}
        </table>
        
        <h3>What Happens Next</h3>
        <ol style="color: #666; line-height: 1.8;">
            <li>We'll review your request and contact you to schedule a pickup date</li>
            <li>Our team will arrive to collect and count your pallets</li>
            <li>You'll receive payment based on the final quantity and condition</li>
        </ol>
        
        <p style="text-align: center; margin-top: 32px;">
            <a href="${siteUrl}/portal/pickups" class="button">View Your Pickups</a>
        </p>
        
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
            Questions? Reply to this email or call us at (678) 881-8282.
        </p>
    `);

    return sendEmail({
        to: customerEmail,
        subject: `Pickup Request Received - #${pickupId.slice(0, 8).toUpperCase()}`,
        html,
    });
}

// Send pickup notification to admin
export async function sendAdminPickupNotification({
    customerName,
    customerEmail,
    customerPhone,
    companyName,
    pickupId,
    palletCondition,
    estimatedQuantity,
    pickupAddress,
    preferredDate,
    notes,
}: {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    companyName?: string;
    pickupId: string;
    palletCondition: string;
    estimatedQuantity: number;
    pickupAddress: string;
    preferredDate?: string;
    notes?: string;
}): Promise<EmailResult> {
    const adminEmail = getAdminEmail();
    if (!adminEmail) {
        console.warn('[Email] ADMIN_EMAIL not configured, skipping admin notification');
        return { success: false, error: 'Admin email not configured' };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const html = wrapInTemplate(`
        <h2>New Pickup Request</h2>
        
        <h3>Customer Information</h3>
        <table>
            ${companyName ? `<tr><td><strong>Company:</strong></td><td>${safeHtml(companyName)}</td></tr>` : ''}
            <tr><td><strong>Contact:</strong></td><td>${safeHtml(customerName)}</td></tr>
            <tr><td><strong>Email:</strong></td><td><a href="mailto:${safeHtml(customerEmail)}">${safeHtml(customerEmail)}</a></td></tr>
            ${customerPhone ? `<tr><td><strong>Phone:</strong></td><td>${safeHtml(customerPhone)}</td></tr>` : ''}
        </table>
        
        <h3>Pickup Details</h3>
        <table>
            <tr><td><strong>Request ID:</strong></td><td>${pickupId.slice(0, 8).toUpperCase()}</td></tr>
            <tr><td><strong>Condition:</strong></td><td>${safeHtml(conditionLabels[palletCondition] || palletCondition)}</td></tr>
            <tr><td><strong>Quantity:</strong></td><td>${estimatedQuantity} pallets</td></tr>
            <tr><td><strong>Address:</strong></td><td>${safeHtml(pickupAddress)}</td></tr>
            ${preferredDate ? `<tr><td><strong>Preferred Date:</strong></td><td>${new Date(preferredDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</td></tr>` : ''}
        </table>

        ${notes ? `
        <h3>Customer Notes</h3>
        <p style="background: #f5f5f5; padding: 12px; border-radius: 8px; color: #666;">${safeHtml(notes)}</p>
        ` : ''}
        
        <p style="text-align: center; margin-top: 32px;">
            <a href="${siteUrl}/admin" class="button">Manage in Admin Panel</a>
        </p>
    `);

    return sendEmail({
        to: adminEmail,
        subject: `New Pickup Request - ${companyName || customerName} (${estimatedQuantity} pallets)`,
        html,
    });
}
