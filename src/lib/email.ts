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
        const emailOptions: {
            from: string;
            to: string;
            subject: string;
            html: string;
            attachments?: { filename: string; content: Buffer }[];
        } = {
            from: FROM_EMAIL,
            to,
            subject,
            html,
        };

        // Add attachments if present
        if (attachments.length > 0) {
            emailOptions.attachments = attachments.map((att, i) => ({
                filename: att.filename || `photo_${i + 1}.jpg`,
                content: Buffer.from(att.content, 'base64'),
            }));
        }

        const { error } = await getResendClient().emails.send(emailOptions);

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
    // Use Supabase storage URL for the logo (publicly accessible)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const logoUrl = `${supabaseUrl}/storage/v1/object/public/assets/logo.jpg`;

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
        .header img { max-height: 48px; width: auto; }
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
            <img src="${logoUrl}" alt="Grunge Pallets" />
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
    // Order confirmations are mandatory - no preference check needed

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
        .map(([key, value]) => `<tr><td><strong>${key}:</strong></td><td>${value}</td></tr>`)
        .join('');

    // Convert base64 data URLs to attachments
    const attachments: EmailAttachment[] = photos.map((photo, i) => {
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
            <tr><td><strong>Name:</strong></td><td>${name}</td></tr>
            <tr><td><strong>Email:</strong></td><td><a href="mailto:${email}">${email}</a></td></tr>
            ${company ? `<tr><td><strong>Company:</strong></td><td>${company}</td></tr>` : ''}
            ${phone ? `<tr><td><strong>Phone:</strong></td><td>${phone}</td></tr>` : ''}
        </table>
        
        <h3>Request Details</h3>
        <table>
            ${detailsHtml}
        </table>
        
        ${photosHtml}
        
        <p style="margin-top: 24px;">
            <a href="mailto:${email}" class="button">Reply to ${name}</a>
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
        <p>Hi ${customerName},</p>
        <p>We've received your pallet pickup request and will review it shortly.</p>
        
        <h3>Request Details</h3>
        <table>
            <tr><td><strong>Request ID:</strong></td><td>${pickupId.slice(0, 8).toUpperCase()}</td></tr>
            <tr><td><strong>Pallet Condition:</strong></td><td>${conditionLabels[palletCondition] || palletCondition}</td></tr>
            <tr><td><strong>Estimated Quantity:</strong></td><td>${estimatedQuantity} pallets</td></tr>
            <tr><td><strong>Pickup Address:</strong></td><td>${pickupAddress}</td></tr>
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
        <h2>🚛 New Pickup Request</h2>
        
        <h3>Customer Information</h3>
        <table>
            ${companyName ? `<tr><td><strong>Company:</strong></td><td>${companyName}</td></tr>` : ''}
            <tr><td><strong>Contact:</strong></td><td>${customerName}</td></tr>
            <tr><td><strong>Email:</strong></td><td><a href="mailto:${customerEmail}">${customerEmail}</a></td></tr>
            ${customerPhone ? `<tr><td><strong>Phone:</strong></td><td>${customerPhone}</td></tr>` : ''}
        </table>
        
        <h3>Pickup Details</h3>
        <table>
            <tr><td><strong>Request ID:</strong></td><td>${pickupId.slice(0, 8).toUpperCase()}</td></tr>
            <tr><td><strong>Condition:</strong></td><td>${conditionLabels[palletCondition] || palletCondition}</td></tr>
            <tr><td><strong>Quantity:</strong></td><td>${estimatedQuantity} pallets</td></tr>
            <tr><td><strong>Address:</strong></td><td>${pickupAddress}</td></tr>
            ${preferredDate ? `<tr><td><strong>Preferred Date:</strong></td><td>${new Date(preferredDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</td></tr>` : ''}
        </table>

        ${notes ? `
        <h3>Customer Notes</h3>
        <p style="background: #f5f5f5; padding: 12px; border-radius: 8px; color: #666;">${notes}</p>
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
