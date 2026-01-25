import crypto from 'crypto';

export const FORMS_WEBHOOK_VERSION = 1;

export function signN8nWebhookPayload(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

