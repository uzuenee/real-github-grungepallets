import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_PREFERENCES = {
    order_confirmations: true,
    shipping_updates: true,
    delivery_notifications: true,
    promotional_emails: false,
};

// Get notification preferences
export async function GET() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', user.id)
        .single();

    // Return stored preferences or defaults
    const preferences = profile?.notification_preferences || DEFAULT_PREFERENCES;

    return NextResponse.json({ preferences });
}

// Update notification preferences
export async function PATCH(request: NextRequest) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Validate preferences object
        const validKeys = ['order_confirmations', 'shipping_updates', 'delivery_notifications', 'promotional_emails'];
        const preferences: Record<string, boolean> = {};

        for (const key of validKeys) {
            if (key in body && typeof body[key] === 'boolean') {
                preferences[key] = body[key];
            }
        }

        // Get current preferences and merge
        const { data: profile } = await supabase
            .from('profiles')
            .select('notification_preferences')
            .eq('id', user.id)
            .single();

        const currentPrefs = profile?.notification_preferences || DEFAULT_PREFERENCES;
        const updatedPrefs = {
            ...currentPrefs,
            ...preferences,
            // Force mandatory notifications to always be true
            order_confirmations: true,
            shipping_updates: true,
            delivery_notifications: true,
        };

        // Save to profile
        const { error } = await supabase
            .from('profiles')
            .update({ notification_preferences: updatedPrefs })
            .eq('id', user.id);

        if (error) {
            console.error('[Notifications] Update error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ preferences: updatedPrefs, success: true });
    } catch (err) {
        console.error('[Notifications] Unexpected error:', err);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
