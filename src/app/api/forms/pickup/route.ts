import { NextRequest, NextResponse } from 'next/server';
import { sendAdminQuoteNotification } from '@/lib/email';
import { FORMS_WEBHOOK_VERSION, signN8nWebhookPayload } from '@/lib/webhooks/n8n';
import crypto from 'crypto';
import { uploadPickupPhotosToSupabase } from '@/lib/uploads/supabaseIntakePhotos';
import { enforceMaxContentLength, enforceRateLimit } from '@/lib/security/requestGuards';

type PickupRequestBody = {
    submissionId?: string;
    data?: {
        palletCondition?: string;
        estimatedQuantity?: string;
        pickupLocation?: string;
        name?: string;
        email?: string;
        company?: string;
        phone?: string;
        notes?: string;
    };
    photos?: string[];
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
        const tooLarge = enforceMaxContentLength(request, 25 * 1024 * 1024);
        if (tooLarge) return tooLarge;

        const limited = enforceRateLimit({
            request,
            keyPrefix: 'forms:pickup',
            limit: 3,
            windowMs: 60_000,
        });
        if ('response' in limited) return limited.response;

        const body = (await request.json()) as PickupRequestBody;
        const data = body.data;

        if (!data) {
            return NextResponse.json({ error: 'Data is required' }, { status: 400 });
        }

        const name = (data.name || '').trim();
        const email = (data.email || '').trim().toLowerCase();
        const phone = (data.phone || '').trim();
        const company = (data.company || '').trim();

        const palletCondition = (data.palletCondition || '').trim();
        const estimatedQuantity = (data.estimatedQuantity || '').trim();
        const pickupLocation = (data.pickupLocation || '').trim();

        if (!palletCondition) return NextResponse.json({ error: 'Pallet condition is required' }, { status: 400 });
        if (!estimatedQuantity) return NextResponse.json({ error: 'Estimated quantity is required' }, { status: 400 });
        const qty = Number.parseInt(estimatedQuantity, 10);
        if (!Number.isFinite(qty) || qty < 1) return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 });
        if (qty > 100000) return NextResponse.json({ error: 'Maximum quantity is 100,000' }, { status: 400 });
        if (!pickupLocation) return NextResponse.json({ error: 'Pickup location is required' }, { status: 400 });

        if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        if (!isValidEmail(email)) return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        if (!phone) return NextResponse.json({ error: 'Phone is required' }, { status: 400 });

        const photos = Array.isArray(body.photos) ? body.photos.slice(0, 3) : [];

        const submissionId = body.submissionId?.trim() || crypto.randomUUID();
        const submittedAt = new Date().toISOString();

        const includeIp = (process.env.FORMS_INCLUDE_IP || '').toLowerCase() === 'true';
        const storePhotosInSupabase = (process.env.FORMS_STORE_PICKUP_PHOTOS_IN_SUPABASE || 'true').toLowerCase() !== 'false';

        const source = {
            pageUrl: request.headers.get('referer'),
            referrerUrl: request.headers.get('referer'),
            userAgent: request.headers.get('user-agent'),
            ip: includeIp ? getClientIp(request) : undefined,
        };

        let uploadedPhotos: { path: string; publicUrl: string }[] = [];
        let photoUploadError: string | undefined;

        if (storePhotosInSupabase && photos.length > 0) {
            try {
                const results = await uploadPickupPhotosToSupabase({
                    submissionId,
                    photos,
                    maxPhotos: 3,
                    maxBytesPerPhoto: 5 * 1024 * 1024,
                });
                uploadedPhotos = results.map(r => ({ path: r.path, publicUrl: r.publicUrl }));
            } catch (err) {
                console.error('[Forms Pickup] Photo upload failed:', err);
                photoUploadError = 'photo_upload_failed';
            }
        }

        const payload = {
            formType: 'pickup',
            version: FORMS_WEBHOOK_VERSION,
            submissionId,
            submittedAt,
            source,
            fields: {
                fullName: name,
                email,
                phone,
                company: company || undefined,
                palletCondition,
                estimatedQuantity,
                pickupLocation,
                message: (data.notes || '').trim() || undefined,
                preferredContactMethod: 'phone',
                photosProvided: photos.length > 0,
                photoCount: photos.length,
                photoUrls: uploadedPhotos.length > 0 ? uploadedPhotos.map(p => p.publicUrl) : undefined,
                photoPaths: uploadedPhotos.length > 0 ? uploadedPhotos.map(p => p.path) : undefined,
                photoUploadError,
            },
        };

        const webhookUrl = process.env.N8N_PICKUP_WEBHOOK_URL;
        const secret = process.env.N8N_WEBHOOK_SECRET;
        if (!webhookUrl) {
            return NextResponse.json({ error: 'N8N_PICKUP_WEBHOOK_URL is not configured' }, { status: 500 });
        }
        if (!secret) {
            return NextResponse.json({ error: 'N8N_WEBHOOK_SECRET is not configured' }, { status: 500 });
        }

        const payloadString = JSON.stringify(payload);
        const signature = signN8nWebhookPayload(payloadString, secret);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const emailPromise = sendAdminQuoteNotification({
            type: 'sell',
            name,
            email,
            company: company || undefined,
            phone,
            details: {
                'Pallet Condition': palletCondition,
                'Estimated Quantity': estimatedQuantity,
                'Pickup Location': pickupLocation,
                'Notes': (data.notes || '').trim() || '',
            },
            photos,
        }).catch((err) => {
            console.error('[Forms Pickup] Email failed:', err);
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
        console.error('[Forms Pickup] Error:', err);
        return NextResponse.json({ error: 'Failed to process pickup submission' }, { status: 500 });
    }
}
