import { supabase } from '@/lib/supabase';


/**
 * Uploads a file (e.g. PDF) to Supabase Storage under the 'knowledge' folder in the 'cardify' bucket and returns the public URL.
 * @param file File to upload
 * @param folder Folder name (default: 'knowledge')
 * @param userId Optional user id for folder structure
 * @param fileName Optional file name (if not provided, generates one)
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



export async function extractTextFromPdf(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  /*
  const res = await fetch("/api/knowledge/extract-pdf", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error || 'Failed to extract PDF text');
  }

  const { text } = await res.json();
  return text;
*/
  return "sukses";
}



/**
 * Upload a PDF to Supabase, extract its text, and return both
 * @param file PDF File
 * @param userId User ID for pathing
 * @param bucket Storage bucket name (default: 'pdfs')
 * @returns { url, text }
 */

export async function uploadPdfAndExtractText(
  file: File,
  userId: string,
  bucket = 'knowledge'
): Promise<{ url: string | null; text: string }> {
  const [url, text] = await Promise.all([
    uploadFileToSupabase(file, bucket, userId, file.name),
    extractTextFromPdf(file),
  ]);
  return { url, text };
}


