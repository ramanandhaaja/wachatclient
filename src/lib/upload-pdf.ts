import { supabase } from '@/lib/supabase';

/**
 * Uploads a file to Supabase Storage and returns the public URL.
 */
export async function uploadFileToSupabase(
  file: File,
  folder = 'knowledge',
  userId?: string,
  fileName?: string
): Promise<string | null> {
  const bucketName = 'cardify';
  if (!file) return null;
  const fileExt = file.name.split('.').pop();
  const finalFileName = fileName || `${userId || 'anon'}-${Date.now()}.${fileExt}`;
  const filePath = `${folder}/${finalFileName}`;

  const { error } = await supabase.storage.from(bucketName).upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,
  });
  if (error) {
    console.error('[SUPABASE] File upload error:', error);
    return null;
  }
  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return data?.publicUrl || null;
}

/**
 * Upload a file to Supabase Storage and return the URL.
 */
export async function uploadPdfAndExtractText(
  file: File,
  userId: string,
  bucket = 'knowledge'
): Promise<{ url: string | null }> {
  const url = await uploadFileToSupabase(file, bucket, userId, file.name);
  return { url };
}
