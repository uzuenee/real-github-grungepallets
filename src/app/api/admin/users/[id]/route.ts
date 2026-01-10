import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!adminProfile?.is_admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { approved, is_admin } = body;

        // Build update object with only provided fields
        const updateData: { approved?: boolean; is_admin?: boolean } = {};
        if (typeof approved === 'boolean') updateData.approved = approved;
        if (typeof is_admin === 'boolean') updateData.is_admin = is_admin;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        // Prevent admin from removing their own admin status
        if (id === user.id && is_admin === false) {
            return NextResponse.json({ error: 'Cannot remove your own admin status' }, { status: 400 });
        }

        // Use admin client to bypass RLS for admin operations
        let adminSupabase;
        try {
            adminSupabase = createAdminClient();
        } catch (clientErr) {
            console.error('Failed to create admin client:', clientErr);
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        console.log('Updating profile:', id, 'with data:', updateData);

        const { data, error } = await adminSupabase
            .from('profiles')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Profile update error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ user: data });
    } catch (err) {
        console.error('User update API error:', err);
        return NextResponse.json({ error: 'Invalid request body', details: String(err) }, { status: 400 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: userId } = await params;
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!adminProfile?.is_admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Prevent admin from deleting themselves
    if (userId === user.id) {
        return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    try {
        // Use admin client with service role key to delete user from auth
        const adminSupabase = createAdminClient();
        const { error } = await adminSupabase.auth.admin.deleteUser(userId);

        if (error) {
            console.error('Auth delete error:', error);
            // If admin API fails, try deleting just the profile
            const { error: profileError } = await adminSupabase
                .from('profiles')
                .delete()
                .eq('id', userId);

            if (profileError) {
                console.error('Profile delete error:', profileError);
                return NextResponse.json({ error: profileError.message }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Delete user error:', err);
        return NextResponse.json({ error: 'Failed to delete user. Make sure SUPABASE_SERVICE_ROLE_KEY is configured.' }, { status: 500 });
    }
}
