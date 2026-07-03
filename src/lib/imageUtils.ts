/**
 * Removes white or near-white background from a base64 image (PNG/JPEG/etc.)
 * and returns a base64 encoded PNG with transparent background.
 */
export function removeWhiteBackground(base64: string, threshold = 230): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!base64 || !base64.startsWith('data:image')) {
      resolve(base64);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64);
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        
        // Loop through each pixel (4 bytes: R, G, B, A)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          
          // If R, G, and B are all above the threshold, make the pixel transparent
          if (r >= threshold && g >= threshold && b >= threshold) {
            data[i+3] = 0; // Alpha = 0 (fully transparent)
          }
        }
        
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error("Error processing image data for transparency", err);
        resolve(base64); // Fallback to original
      }
    };
    img.onerror = (err) => {
      reject(err);
    };
    img.src = base64;
  });
}
