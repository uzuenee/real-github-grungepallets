import { NextRequest, NextResponse } from 'next/server';
import { sendAdminQuoteNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, data } = body;

        if (!type || !data) {
            return NextResponse.json(
                { error: 'Type and data are required' },
                { status: 400 }
            );
        }

        // Validate required contact fields
        const { name, email } = data;
        if (!name || !email) {
            return NextResponse.json(
                { error: 'Name and email are required' },
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

        // Build details based on quote type
        let details: Record<string, string> = {};

        if (type === 'buy') {
            details = {
                'Pallet Type': data.palletType || '',
                'Quantity': data.quantity || '',
                'Frequency': data.frequency || '',
                'Delivery Location': data.deliveryLocation || '',
                'Notes': data.notes || '',
            };
        } else if (type === 'sell') {
            details = {
                'Pallet Condition': data.palletCondition || '',
                'Estimated Quantity': data.estimatedQuantity || '',
                'Pickup Location': data.pickupLocation || '',
                'Notes': data.notes || '',
            };
        }

        // Send admin notification email
        const result = await sendAdminQuoteNotification({
            type,
            name,
            email,
            company: data.company,
            phone: data.phone,
            details,
        });

        if (!result.success) {
            console.error('[Quote API] Email failed:', result.error);
            // Still return success to user
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[Quote API] Error:', err);
        return NextResponse.json(
            { error: 'Failed to process quote request' },
            { status: 500 }
        );
    }
}
