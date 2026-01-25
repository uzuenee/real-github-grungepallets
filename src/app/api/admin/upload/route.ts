import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import crypto from 'crypto';
import { enforceMaxContentLength, enforceRateLimit } from '@/lib/security/requestGuards';

export async function POST(request: NextRequest) {
    try {
        const tooLarge = enforceMaxContentLength(request, 7 * 1024 * 1024);
        if (tooLarge) return tooLarge;

        const limited = enforceRateLimit({
            request,
            keyPrefix: 'admin:upload',
            limit: 30,
            windowMs: 60_000,
        });
        if ('response' in limited) return limited.response;

        const supabase = await createClient();

        // Check if user is authenticated and admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Use admin client to bypass RLS for profile check
        const adminClient = createAdminClient();
        const { data: profile } = await adminClient
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile?.is_admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get the file from form data
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const productIdRaw = String(formData.get('productId') || '').trim();
        const productId = /^[a-zA-Z0-9_-]{1,64}$/.test(productIdRaw) ? productIdRaw : 'temp';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Please use JPEG, PNG, WebP, or GIF.' }, { status: 400 });
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
        }

        // Generate a unique filename
        const contentTypeToExt: Record<string, string> = {
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp',
            'image/gif': 'gif',
        };
        const ext = contentTypeToExt[file.type] || 'bin';
        const filename = `${productId}-${crypto.randomUUID()}.${ext}`;

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        // Upload to Supabase Storage using admin client
        const { data: uploadData, error: uploadError } = await adminClient
            .storage
            .from('product-images')
            .upload(filename, buffer, {
                contentType: file.type,
                upsert: true
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }

        // Get the public URL
        const { data: { publicUrl } } = adminClient
            .storage
            .from('product-images')
            .getPublicUrl(uploadData.path);

        return NextResponse.json({
            url: publicUrl,
            path: uploadData.path
        });
    } catch (error) {
        console.error('Image upload error:', error);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }
}
