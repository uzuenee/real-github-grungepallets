import { NextRequest, NextResponse } from 'next/server';
import { sendAdminContactNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, company, phone, message } = body;

        // Validate required fields
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Name, email, and message are required' },
                { status: 400 }
            );
        }

        // Email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            );
        }

        // Send admin notification email
        const result = await sendAdminContactNotification({
            name,
            email,
            company,
            phone,
            message,
        });

        if (!result.success) {
            console.error('[Contact API] Email failed:', result.error);
            // Still return success to user - they don't need to know email failed
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[Contact API] Error:', err);
        return NextResponse.json(
            { error: 'Failed to process contact form' },
            { status: 500 }
        );
    }
}
