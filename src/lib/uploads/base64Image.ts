export type ParsedBase64Image = {
    contentType: string;
    bytes: Uint8Array;
    extension: string;
};

function estimateBase64DecodedBytes(base64: string): number {
    const sanitized = base64.trim().replace(/\s+/g, '');
    if (!sanitized) return 0;

    const padding = sanitized.endsWith('==') ? 2 : sanitized.endsWith('=') ? 1 : 0;
    return Math.floor((sanitized.length * 3) / 4) - padding;
}

const CONTENT_TYPE_TO_EXT: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
};

function detectImageContentType(bytes: Uint8Array): string | null {
    if (bytes.byteLength < 12) return null;

    // JPEG: FF D8 FF
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47 &&
        bytes[4] === 0x0d &&
        bytes[5] === 0x0a &&
        bytes[6] === 0x1a &&
        bytes[7] === 0x0a
    ) {
        return 'image/png';
    }

    // GIF: "GIF87a" / "GIF89a"
    if (
        bytes[0] === 0x47 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x38 &&
        (bytes[4] === 0x37 || bytes[4] === 0x39) &&
        bytes[5] === 0x61
    ) {
        return 'image/gif';
    }

    // WebP: "RIFF"...."WEBP"
    if (
        bytes[0] === 0x52 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x46 &&
        bytes[8] === 0x57 &&
        bytes[9] === 0x45 &&
        bytes[10] === 0x42 &&
        bytes[11] === 0x50
    ) {
        return 'image/webp';
    }

    return null;
}

export function parseBase64Image(
    input: string,
    options?: {
        maxBytes?: number;
        allowedContentTypes?: string[];
    }
): ParsedBase64Image {
    const trimmed = input.trim();

    const dataUrlMatch = trimmed.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (dataUrlMatch) {
        const contentType = dataUrlMatch[1];
        const base64 = dataUrlMatch[2];
        if (options?.allowedContentTypes && !options.allowedContentTypes.includes(contentType)) {
            throw new Error('Unsupported image type');
        }
        if (typeof options?.maxBytes === 'number' && estimateBase64DecodedBytes(base64) > options.maxBytes) {
            throw new Error('Image exceeds max size');
        }
        const bytes = Buffer.from(base64, 'base64');
        const extension = CONTENT_TYPE_TO_EXT[contentType] || 'bin';
        return { contentType, bytes, extension };
    }

    // Fallback: treat as base64 without metadata
    if (typeof options?.maxBytes === 'number' && estimateBase64DecodedBytes(trimmed) > options.maxBytes) {
        throw new Error('Image exceeds max size');
    }
    const bytes = Buffer.from(trimmed, 'base64');
    const detectedContentType = detectImageContentType(bytes);
    if (!detectedContentType) {
        throw new Error('Unsupported image type');
    }
    if (options?.allowedContentTypes && !options.allowedContentTypes.includes(detectedContentType)) {
        throw new Error('Unsupported image type');
    }

    const extension = CONTENT_TYPE_TO_EXT[detectedContentType] || 'bin';
    return { contentType: detectedContentType, bytes, extension };
}
