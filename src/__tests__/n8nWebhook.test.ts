import crypto from 'crypto';
import { signN8nWebhookPayload } from '@/lib/webhooks/n8n';

describe('n8n webhook signing', () => {
    it('matches crypto HMAC SHA-256 hex digest', () => {
        const payload = JSON.stringify({ hello: 'world', n: 1 });
        const secret = 'test-secret';

        const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
        expect(signN8nWebhookPayload(payload, secret)).toBe(expected);
    });
});

