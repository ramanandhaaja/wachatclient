// Utility to resize and compress images before upload (browser only)
export async function resizeImageFile(
  file: File,
  maxWidth: number,
  maxHeight: number,
  maxSizeMB: number = 1
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const { width, height } = img;
      const scale = Math.min(maxWidth / width, maxHeight / height, 1);
      const newWidth = Math.round(width * scale);
      const newHeight = Math.round(height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));

      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Try JPEG first, fallback to PNG if needed
      function tryExport(quality: number) {
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Image compression failed'));
            if (blob.size / 1024 / 1024 <= maxSizeMB || quality < 0.5) {
              resolve(new File([blob], file.name, { type: blob.type }));
            } else {
              tryExport(quality - 0.1);
            }
          },
          'image/jpeg',
          quality
        );
      }
      tryExport(0.92); // Start with high quality
    };

    img.onerror = reject;
    img.src = url;
  });
}
