import { safeRedirectPath } from '@/lib/security/safeRedirect';
import { parseBase64Image } from '@/lib/uploads/base64Image';

describe('Security utilities', () => {
    describe('safeRedirectPath', () => {
        it('allows normal relative paths', () => {
            expect(safeRedirectPath('/portal', '/')).toBe('/portal');
            expect(safeRedirectPath('/portal/orders?id=1', '/')).toBe('/portal/orders?id=1');
        });

        it('rejects external/invalid redirect inputs', () => {
            expect(safeRedirectPath('https://evil.com', '/')).toBe('/');
            expect(safeRedirectPath('//evil.com', '/')).toBe('/');
            expect(safeRedirectPath('javascript:alert(1)', '/')).toBe('/');
            expect(safeRedirectPath('/\\evil', '/')).toBe('/');
            expect(safeRedirectPath('/good\r\nbad', '/')).toBe('/');
        });
    });

    describe('parseBase64Image', () => {
        it('throws before decoding when maxBytes exceeded', () => {
            const bytes = Buffer.alloc(11, 1);
            const base64 = bytes.toString('base64');

            expect(() => parseBase64Image(base64, { maxBytes: 10 })).toThrow('Image exceeds max size');
        });

        it('rejects raw base64 when type cannot be detected', () => {
            const bytes = Buffer.from('not-an-image');
            const base64 = bytes.toString('base64');

            expect(() =>
                parseBase64Image(base64, {
                    maxBytes: 1024,
                    allowedContentTypes: ['image/png', 'image/jpeg'],
                })
            ).toThrow('Unsupported image type');
        });

        it('accepts raw base64 when type is detectable and allowed', () => {
            const jpegLike = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
            const base64 = jpegLike.toString('base64');

            const parsed = parseBase64Image(base64, {
                maxBytes: 1024,
                allowedContentTypes: ['image/jpeg'],
            });

            expect(parsed.contentType).toBe('image/jpeg');
            expect(parsed.extension).toBe('jpg');
        });

        it('accepts small images with allowed content type', () => {
            const bytes = Buffer.from([0, 1, 2, 3]);
            const base64 = bytes.toString('base64');
            const dataUrl = `data:image/png;base64,${base64}`;

            const parsed = parseBase64Image(dataUrl, {
                maxBytes: 10,
                allowedContentTypes: ['image/png'],
            });

            expect(parsed.contentType).toBe('image/png');
            expect(parsed.bytes.byteLength).toBe(4);
            expect(parsed.extension).toBe('png');
        });
    });
});
