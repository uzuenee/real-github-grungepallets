import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/server';
import { parseBase64Image } from '@/lib/uploads/base64Image';

export type UploadedPhoto = {
    path: string;
    publicUrl: string;
    contentType: string;
    sizeBytes: number;
};

export async function uploadPickupPhotosToSupabase(params: {
    submissionId: string;
    photos: string[];
    maxPhotos: number;
    maxBytesPerPhoto: number;
}): Promise<UploadedPhoto[]> {
    const { submissionId, photos, maxPhotos, maxBytesPerPhoto } = params;

    if (!Array.isArray(photos)) return [];
    const limited = photos.slice(0, maxPhotos);

    const bucket = process.env.SUPABASE_INTAKE_BUCKET;
    if (!bucket) {
        throw new Error('SUPABASE_INTAKE_BUCKET is not configured');
    }

    const supabase = createAdminClient();
    const uploaded: UploadedPhoto[] = [];

    for (let i = 0; i < limited.length; i++) {
        const parsed = parseBase64Image(limited[i], {
            maxBytes: maxBytesPerPhoto,
            allowedContentTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
        });
        const sizeBytes = parsed.bytes.byteLength;
        if (sizeBytes > maxBytesPerPhoto) {
            throw new Error(`Photo ${i + 1} exceeds max size`);
        }

        const path = `pickup/${submissionId}/${i + 1}-${crypto.randomUUID()}.${parsed.extension}`;

        const { error } = await supabase.storage.from(bucket).upload(path, parsed.bytes, {
            contentType: parsed.contentType,
            upsert: false,
            cacheControl: '3600',
        });
        if (error) {
            throw new Error(`Failed to upload photo ${i + 1}: ${error.message}`);
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        if (!data?.publicUrl) {
            throw new Error(`Failed to compute public URL for photo ${i + 1}`);
        }

        uploaded.push({
            path,
            publicUrl: data.publicUrl,
            contentType: parsed.contentType,
            sizeBytes,
        });
    }

    return uploaded;
}
