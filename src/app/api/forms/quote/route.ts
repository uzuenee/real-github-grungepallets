import { NextRequest, NextResponse } from 'next/server';
import { sendAdminQuoteNotification } from '@/lib/email';
import { FORMS_WEBHOOK_VERSION, signN8nWebhookPayload } from '@/lib/webhooks/n8n';
import crypto from 'crypto';
import { enforceMaxContentLength, enforceRateLimit } from '@/lib/security/requestGuards';

type QuoteRequestBody = {
    submissionId?: string;
    data?: {
        palletType?: string;
        quantity?: string;
        frequency?: 'one-time' | 'weekly' | 'monthly';
        deliveryLocation?: string;
        needByDate?: string;
        name?: string;
        email?: string;
        company?: string;
        phone?: string;
        notes?: string;
    };
};

function getClientIp(request: NextRequest): string | null {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        const first = forwardedFor.split(',')[0]?.trim();
        return first || null;
    }
    return null;
}

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
    try {
        const tooLarge = enforceMaxContentLength(request, 96 * 1024);
        if (tooLarge) return tooLarge;

        const limited = enforceRateLimit({
            request,
            keyPrefix: 'forms:quote',
            limit: 5,
            windowMs: 60_000,
        });
        if ('response' in limited) return limited.response;

        const body = (await request.json()) as QuoteRequestBody;
        const data = body.data;

        if (!data) {
            return NextResponse.json({ error: 'Data is required' }, { status: 400 });
        }

        const name = (data.name || '').trim();
        const email = (data.email || '').trim().toLowerCase();
        const phone = (data.phone || '').trim();
        const company = (data.company || '').trim();

        const palletType = (data.palletType || '').trim();
        const quantity = (data.quantity || '').trim();
        const deliveryLocation = (data.deliveryLocation || '').trim();

        if (!palletType) return NextResponse.json({ error: 'Pallet type is required' }, { status: 400 });
        if (!quantity) return NextResponse.json({ error: 'Quantity is required' }, { status: 400 });
        const qty = Number.parseInt(quantity, 10);
        if (!Number.isFinite(qty) || qty < 1) return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 });
        if (qty > 100000) return NextResponse.json({ error: 'Maximum quantity is 100,000' }, { status: 400 });
        if (!deliveryLocation) return NextResponse.json({ error: 'Delivery location is required' }, { status: 400 });

        if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        if (!isValidEmail(email)) return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        if (!phone) return NextResponse.json({ error: 'Phone is required' }, { status: 400 });

        const submissionId = body.submissionId?.trim() || crypto.randomUUID();
        const submittedAt = new Date().toISOString();

        const includeIp = (process.env.FORMS_INCLUDE_IP || '').toLowerCase() === 'true';
        const source = {
            pageUrl: request.headers.get('referer'),
            referrerUrl: request.headers.get('referer'),
            userAgent: request.headers.get('user-agent'),
            ip: includeIp ? getClientIp(request) : undefined,
        };

        const payload = {
            formType: 'quote',
            version: FORMS_WEBHOOK_VERSION,
            submissionId,
            submittedAt,
            source,
            fields: {
                fullName: name,
                email,
                phone,
                company: company || undefined,
                palletType,
                quantity,
                frequency: data.frequency || 'one-time',
                deliveryLocation,
                needByDate: (data.needByDate || '').trim() || undefined,
                message: (data.notes || '').trim() || undefined,
                preferredContactMethod: 'phone',
            },
        };

        const webhookUrl = process.env.N8N_QUOTE_WEBHOOK_URL;
        const secret = process.env.N8N_WEBHOOK_SECRET;
        if (!webhookUrl) {
            return NextResponse.json({ error: 'N8N_QUOTE_WEBHOOK_URL is not configured' }, { status: 500 });
        }
        if (!secret) {
            return NextResponse.json({ error: 'N8N_WEBHOOK_SECRET is not configured' }, { status: 500 });
        }

        const payloadString = JSON.stringify(payload);
        const signature = signN8nWebhookPayload(payloadString, secret);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const emailPromise = sendAdminQuoteNotification({
            type: 'buy',
            name,
            email,
            company: company || undefined,
            phone,
            details: {
                'Pallet Type': palletType,
                'Quantity': quantity,
                'Frequency': data.frequency || 'one-time',
                'Delivery Location': deliveryLocation,
                'Need By Date': (data.needByDate || '').trim() || 'Not specified',
                'Notes': (data.notes || '').trim() || '',
            },
            photos: [],
        }).catch((err) => {
            console.error('[Forms Quote] Email failed:', err);
            return { success: false as const };
        });

        let webhookResponse: Response;
        try {
            webhookResponse = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Form-Version': String(FORMS_WEBHOOK_VERSION),
                    'X-Idempotency-Key': submissionId,
                    'X-Signature': signature,
                },
                body: payloadString,
                signal: controller.signal,
            });
        } finally {
            clearTimeout(timeout);
        }

        await emailPromise;

        if (!webhookResponse.ok) {
            const text = await webhookResponse.text().catch(() => '');
            return NextResponse.json(
                {
                    ok: false,
                    retryable: true,
                    error: 'Failed to forward submission',
                    details: text ? { upstream: text } : undefined,
                },
                { status: 502 }
            );
        }

        let upstream: unknown = null;
        try {
            upstream = await webhookResponse.json();
        } catch {
            upstream = null;
        }

        return NextResponse.json({
            ok: true,
            submissionId,
            upstream,
        });
    } catch (err) {
        console.error('[Forms Quote] Error:', err);
        return NextResponse.json({ error: 'Failed to process quote submission' }, { status: 500 });
    }
}
