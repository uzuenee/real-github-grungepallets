type RateLimitOptions = {
    limit: number;
    windowMs: number;
};

export type RateLimitResult = {
    allowed: boolean;
    limit: number;
    remaining: number;
    resetAt: number;
    retryAfterSeconds: number;
    headers: Record<string, string>;
};

type Counter = {
    count: number;
    resetAt: number;
};

const counters = new Map<string, Counter>();
let pruneCounter = 0;

function pruneExpired(now: number) {
    pruneCounter++;
    if (pruneCounter % 100 !== 0) return;

    for (const [key, counter] of counters.entries()) {
        if (counter.resetAt <= now) {
            counters.delete(key);
        }
    }
}

export function rateLimit(key: string, options: RateLimitOptions): RateLimitResult {
    const now = Date.now();
    pruneExpired(now);

    const limit = Math.max(1, Math.floor(options.limit));
    const windowMs = Math.max(250, Math.floor(options.windowMs));

    const existing = counters.get(key);
    const counter: Counter =
        existing && existing.resetAt > now
            ? existing
            : { count: 0, resetAt: now + windowMs };

    counter.count += 1;
    counters.set(key, counter);

    const allowed = counter.count <= limit;
    const remaining = Math.max(0, limit - counter.count);
    const retryAfterSeconds = allowed ? 0 : Math.ceil((counter.resetAt - now) / 1000);

    return {
        allowed,
        limit,
        remaining,
        resetAt: counter.resetAt,
        retryAfterSeconds,
        headers: {
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': String(remaining),
            'X-RateLimit-Reset': String(Math.ceil(counter.resetAt / 1000)),
            ...(allowed ? {} : { 'Retry-After': String(retryAfterSeconds) }),
        },
    };
}

