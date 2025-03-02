/**
 * Utility functions for file handling and validation
 */

// Maximum file size in bytes (2MB)
export const MAX_FILE_SIZE = 2 * 1024 * 1024;

// Allowed image MIME types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

/**
 * Validates a file for upload
 * @param file The file to validate
 * @param options Validation options
 * @returns An object with validation result and error message if any
 */
export const validateFile = (
  file: File,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } => {
  const { maxSize = MAX_FILE_SIZE, allowedTypes = ALLOWED_IMAGE_TYPES } = options;

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return {
      valid: false,
      error: `File size exceeds the maximum allowed size (${maxSizeMB}MB)`,
    };
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes
        .map((type) => type.replace('image/', ''))
        .join(', ')}`,
    };
  }

  return { valid: true };
};

/**
 * Generates a secure filename for storage
 * @param originalFilename The original filename
 * @returns A secure filename
 */
export const generateSecureFilename = (originalFilename: string): string => {
  // Extract file extension
  const fileExtension = originalFilename.split('.').pop()?.toLowerCase() || '';
  
  // For SVG files, use 'svg' as the extension instead of 'svg+xml'
  const normalizedExtension = fileExtension === 'svg+xml' ? 'svg' : fileExtension;
  
  // Generate a random string for the filename
  const randomString = Math.random().toString(36).substring(2, 15);
  
  // Create a timestamp
  const timestamp = Date.now();
  
  // Return the secure filename
  return `${timestamp}_${randomString}.${normalizedExtension}`;
}; 