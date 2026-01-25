import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { rateLimit, type RateLimitResult } from '@/lib/security/rateLimit';

export function getClientIp(request: NextRequest): string | null {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        const first = forwardedFor.split(',')[0]?.trim();
        return first || null;
    }

    const realIp = request.headers.get('x-real-ip');
    if (realIp) return realIp.trim() || null;

    return null;
}

export function enforceMaxContentLength(request: NextRequest, maxBytes: number): NextResponse | null {
    const header = request.headers.get('content-length');
    if (!header) return null;

    const parsed = Number.parseInt(header, 10);
    if (!Number.isFinite(parsed)) return null;

    if (parsed > maxBytes) {
        return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    return null;
}

export function enforceRateLimit(params: {
    request: NextRequest;
    keyPrefix: string;
    limit: number;
    windowMs: number;
}): { response: NextResponse } | { result: RateLimitResult } {
    const { request, keyPrefix, limit, windowMs } = params;
    const ip = getClientIp(request) || 'unknown';

    const result = rateLimit(`${keyPrefix}:${ip}`, { limit, windowMs });
    if (!result.allowed) {
        return {
            response: NextResponse.json(
                { error: 'Too many requests' },
                { status: 429, headers: result.headers }
            ),
        };
    }

    return { result };
}

