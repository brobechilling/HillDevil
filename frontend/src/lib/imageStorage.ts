// Image storage utilities to handle large images efficiently
// This prevents localStorage quota exceeded errors

const MAX_IMAGE_SIZE = 500 * 1024; // 500KB max per image
const STORAGE_PREFIX = 'img_';

// Compress image to reduce size while maintaining quality
export const compressImage = (file: File, maxSizeKB: number = 500): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions - keep higher resolution for better quality
      let { width, height } = img;
      const maxDimension = 1200; // Increased from 800 for better quality
      
      // Only resize if image is very large
      if (width > 2000 || height > 2000) {
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Enable image smoothing for better quality
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
      }
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Start with higher quality
      let quality = 0.9; // Increased from 0.8
      let dataUrl = canvas.toDataURL('image/jpeg', quality);
      
      // Reduce quality more gradually
      while (dataUrl.length > maxSizeKB * 1024 && quality > 0.3) {
        quality -= 0.05; // Smaller steps for better quality
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }
      
      resolve(dataUrl);
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

// Store image with size check
export const storeImage = async (file: File, key: string): Promise<string> => {
  try {
    // Compress image first
    const compressedDataUrl = await compressImage(file);
    
    // Check if still too large
    if (compressedDataUrl.length > MAX_IMAGE_SIZE) {
      throw new Error('Image too large even after compression');
    }
    
    // Store in localStorage
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, compressedDataUrl);
    return compressedDataUrl;
  } catch (error) {
    console.error('Failed to store image:', error);
    throw error;
  }
};

// Get stored image
export const getStoredImage = (key: string): string | null => {
  return localStorage.getItem(`${STORAGE_PREFIX}${key}`);
};

// Remove stored image
export const removeStoredImage = (key: string): void => {
  localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
};

// Check localStorage quota
export const checkStorageQuota = (): { used: number; available: number } => {
  let used = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += localStorage[key].length;
    }
  }
  
  // Estimate available space (browsers typically allow 5-10MB)
  const estimatedTotal = 10 * 1024 * 1024; // 10MB
  const available = Math.max(0, estimatedTotal - used);
  
  return { used, available };
};

// Clean up old images to free space
export const cleanupOldImages = (): void => {
  const imageKeys = Object.keys(localStorage)
    .filter(key => key.startsWith(STORAGE_PREFIX))
    .map(key => ({
      key,
      timestamp: parseInt(key.split('_')[1]) || 0,
      size: localStorage[key].length
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
  
  // Remove oldest images if storage is getting full
  const { used, available } = checkStorageQuota();
  if (available < 1024 * 1024) { // Less than 1MB available
    const imagesToRemove = imageKeys.slice(0, Math.floor(imageKeys.length / 2));
    imagesToRemove.forEach(({ key }) => {
      localStorage.removeItem(key);
    });
  }
};

// Generate unique key for image
export const generateImageKey = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Clear all stored images to free up space
export const clearAllStoredImages = (): void => {
  const imageKeys = Object.keys(localStorage)
    .filter(key => key.startsWith(STORAGE_PREFIX));
  
  imageKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log(`Cleared ${imageKeys.length} stored images`);
};

// Get image quality info
export const getImageQualityInfo = (imageUrl: string): { size: number; quality: string } => {
  const size = imageUrl.length;
  let quality = 'Unknown';
  
  if (size < 100 * 1024) {
    quality = 'Low';
  } else if (size < 300 * 1024) {
    quality = 'Medium';
  } else if (size < 500 * 1024) {
    quality = 'High';
  } else {
    quality = 'Very High';
  }
  
  return { size, quality };
};
