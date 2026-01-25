const MAX_REDIRECT_PATH_LENGTH = 2048;

export function safeRedirectPath(input: string | null | undefined, fallback: string): string {
    if (typeof input !== 'string') return fallback;

    const next = input.trim();
    if (!next) return fallback;
    if (next.length > MAX_REDIRECT_PATH_LENGTH) return fallback;

    if (next.includes('\r') || next.includes('\n') || next.includes('\0')) return fallback;

    // Only allow same-origin relative paths like "/portal".
    if (!next.startsWith('/')) return fallback;
    if (next.startsWith('//')) return fallback;
    if (next.includes('\\')) return fallback;

    return next;
}

