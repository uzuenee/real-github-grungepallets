import { NextRequest, NextResponse } from 'next/server';
import { sendAdminContactNotification } from '@/lib/email';
import { FORMS_WEBHOOK_VERSION, signN8nWebhookPayload } from '@/lib/webhooks/n8n';
import crypto from 'crypto';
import { enforceMaxContentLength, enforceRateLimit } from '@/lib/security/requestGuards';

type ContactRequestBody = {
    submissionId?: string;
    name?: string;
    email?: string;
    company?: string;
    phone?: string;
    message?: string;
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
        const tooLarge = enforceMaxContentLength(request, 64 * 1024);
        if (tooLarge) return tooLarge;

        const limited = enforceRateLimit({
            request,
            keyPrefix: 'forms:contact',
            limit: 5,
            windowMs: 60_000,
        });
        if ('response' in limited) return limited.response;

        const body = (await request.json()) as ContactRequestBody;

        const name = (body.name || '').trim();
        const email = (body.email || '').trim().toLowerCase();
        const company = (body.company || '').trim();
        const phone = (body.phone || '').trim();
        const message = (body.message || '').trim();

        if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        if (!isValidEmail(email)) return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        if (!phone) return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
        if (!message) return NextResponse.json({ error: 'Message is required' }, { status: 400 });

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
            formType: 'contact',
            version: FORMS_WEBHOOK_VERSION,
            submissionId,
            submittedAt,
            source,
            fields: {
                fullName: name,
                email,
                phone: phone || undefined,
                company: company || undefined,
                message,
                preferredContactMethod: phone ? 'phone' : 'email',
            },
        };

        const webhookUrl = process.env.N8N_CONTACT_WEBHOOK_URL;
        const secret = process.env.N8N_WEBHOOK_SECRET;
        if (!webhookUrl) {
            return NextResponse.json({ error: 'N8N_CONTACT_WEBHOOK_URL is not configured' }, { status: 500 });
        }
        if (!secret) {
            return NextResponse.json({ error: 'N8N_WEBHOOK_SECRET is not configured' }, { status: 500 });
        }

        const payloadString = JSON.stringify(payload);
        const signature = signN8nWebhookPayload(payloadString, secret);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const emailPromise = sendAdminContactNotification({
            name,
            email,
            company: company || undefined,
            phone: phone || undefined,
            message,
        }).catch((err) => {
            console.error('[Forms Contact] Email failed:', err);
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
        console.error('[Forms Contact] Error:', err);
        return NextResponse.json({ error: 'Failed to process contact submission' }, { status: 500 });
    }
}
