// src/utils/imageCompression.js

/**
 * Compresses an image file before upload
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @param {number} options.maxSizeMB - Maximum size in MB (default: 1MB)
 * @param {number} options.maxWidthOrHeight - Max width/height in pixels (default: 1200px)
 * @param {number} options.initialQuality - Initial JPEG quality (0-1, default: 0.8)
 * @returns {Promise<File>} - Compressed file
 */
export const compressImageFile = async (file, options = {}) => {
    const { 
      maxSizeMB = 1, 
      maxWidthOrHeight = 1200,
      initialQuality = 0.8
    } = options;
    
    return new Promise((resolve, reject) => {
      // Check if file is actually an image
      if (!file || !file.type.match(/image.*/)) {
        return reject(new Error('Not an image file'));
      }
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          // Create canvas for resizing/compression
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidthOrHeight) {
              height = Math.round(height * maxWidthOrHeight / width);
              width = maxWidthOrHeight;
            }
          } else {
            if (height > maxWidthOrHeight) {
              width = Math.round(width * maxWidthOrHeight / height);
              height = maxWidthOrHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw image on canvas
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, width, height);
          
          // Start with initial quality
          const maxSizeBytes = maxSizeMB * 1024 * 1024;
          let quality = initialQuality;
          
          const compressRecursive = (q) => {
            const dataUrl = canvas.toDataURL('image/jpeg', q);
            
            // Calculate approximate size
            const base64str = dataUrl.split(',')[1];
            const sizeInBytes = Math.ceil((base64str.length * 3) / 4);
            
            console.log(`Compressed image: ${(sizeInBytes / (1024 * 1024)).toFixed(2)}MB with quality ${q}`);
            
            if (sizeInBytes > maxSizeBytes && q > 0.1) {
              // Still too large, try lower quality
              return compressRecursive(Math.max(0.1, q - 0.1));
            }
            
            // Convert data URL to File object
            const binaryStr = atob(base64str);
            const len = binaryStr.length;
            const bytes = new Uint8Array(len);
            
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryStr.charCodeAt(i);
            }
            
            // Create a new filename with quality info
            const filenameParts = file.name.split('.');
            const ext = filenameParts.pop();
            const newFilename = `${filenameParts.join('.')}_compressed.jpg`;
            
            const compressedFile = new File(
              [bytes], 
              newFilename, 
              { type: 'image/jpeg' }
            );
            
            resolve(compressedFile);
          };
          
          compressRecursive(quality);
        };
        
        img.onerror = (error) => {
          reject(error);
        };
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };
  
  /**
   * Compresses a base64 string image
   * @param {string} base64Image - Base64 encoded image
   * @param {Object} options - Compression options
   * @param {number} options.maxSizeMB - Maximum size in MB
   * @param {number} options.maxWidthOrHeight - Max width/height in pixels
   * @param {number} options.quality - JPEG quality (0-1)
   * @returns {Promise<string>} - Compressed base64 string
   */
  export const compressBase64Image = async (base64Image, options = {}) => {
    const {
      maxSizeMB = 1,
      maxWidthOrHeight = 1200,
      quality = 0.8
    } = options;
    
    return new Promise((resolve, reject) => {
      // Remove data URL prefix if needed
      const base64Data = base64Image.includes('base64,') 
        ? base64Image.split('base64,')[1] 
        : base64Image;
      
      // Calculate approximate size of the base64 data
      const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
      
      // If already small enough, return original
      if (sizeInBytes <= maxSizeMB * 1024 * 1024) {
        console.log('Base64 image already small enough:', (sizeInBytes / (1024 * 1024)).toFixed(2), 'MB');
        return resolve(base64Image);
      }
      
      // Create image from base64
      const img = new Image();
      
      img.onload = () => {
        // Create canvas for resizing/compression
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidthOrHeight) {
            height = Math.round(height * maxWidthOrHeight / width);
            width = maxWidthOrHeight;
          }
        } else {
          if (height > maxWidthOrHeight) {
            width = Math.round(width * maxWidthOrHeight / height);
            height = maxWidthOrHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw image on canvas
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get compressed data URL
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        console.log('Compressed base64 image from', 
          (sizeInBytes / (1024 * 1024)).toFixed(2), 'MB to',
          (Math.ceil((dataUrl.split('base64,')[1].length * 3) / 4) / (1024 * 1024)).toFixed(2), 'MB'
        );
        
        resolve(dataUrl);
      };
      
      img.onerror = (error) => {
        console.error('Error loading image for compression:', error);
        reject(error);
      };
      
      // Set source to trigger loading
      img.src = base64Image.includes('base64,') ? base64Image : `data:image/svg+xml;base64,${base64Image}`;
    });
  };