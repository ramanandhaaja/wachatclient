import { supabase } from '@/lib/supabase';

/**
 * Uploads a file to the given Supabase storage bucket and returns the public URL
 * @param file File to upload
 * @param bucketName Bucket name (e.g. 'profile-images')
 * @param userId Optional user id for folder structure
 */
export async function uploadImageToSupabase(file: File, folder = 'coverimage', userId?: string): Promise<string | null> {
  // Always upload to bucket 'cardfiy', configurable folder
  const bucketName = 'cardify';
  if (!file) return null;
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId || 'anon'}-${Date.now()}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  // Upload image
  const { error } = await supabase.storage.from(bucketName).upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,
  });
  if (error) {
    console.error('[SUPABASE] Image upload error:', error);
    return null;
  }

  // Get public URL
  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return data?.publicUrl || null;
}
