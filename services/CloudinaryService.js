// Cloudinary Upload Service
export class CloudinaryService {
  // Configure these via environment variables before publishing the repo
  static uploadCloud = process.env.CLOUDINARY_CLOUD_NAME || 'CLOUDINARY_CLOUD_NAME';
  static uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'CLOUDINARY_UPLOAD_PRESET';
  static apiKey = process.env.CLOUDINARY_API_KEY || 'CLOUDINARY_API_KEY';
  
  static async uploadImage(imageUri, folder = "profile_photos") {
    try {
      if (!this.uploadCloud || !this.uploadPreset) {
        throw new Error('Cloudinary configuration is missing (uploadCloud or uploadPreset)');
      }

      const data = new FormData();

      // Infer filename and mime-type from the URI
      const uriParts = String(imageUri).split('/');
      const rawName = uriParts[uriParts.length - 1] || `upload_${Date.now()}`;
      const extMatch = /\.([a-zA-Z0-9]+)$/.exec(rawName);
      const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
      const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
      const fileName = rawName.includes('.') ? rawName : `profile_${Date.now()}.${ext}`;

      data.append('file', {
        uri: imageUri,
        type: mimeType,
        name: fileName,
      });

      data.append('upload_preset', this.uploadPreset);
      data.append('folder', folder);

      // Do NOT set the Content-Type header manually when sending FormData in React Native.
      // The runtime must add the multipart boundary for the request to be valid.
      const response = await fetch(`https://api.cloudinary.com/v1_1/${this.uploadCloud}/image/upload`, {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`Upload failed with status: ${response.status} ${text}`);
      }

      const result = await response.json();
      // Return the full result so callers can use secure_url, public_id, etc.
      return result;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  }
}