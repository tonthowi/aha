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
  // 'image/svg+xml', // Removed for security reasons
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
  
  // Ensure the extension only contains alphanumeric characters
  const safeExtension = fileExtension.replace(/[^a-z0-9]/gi, '');
  
  // Generate a random string for the filename (alphanumeric only)
  const randomString = Math.random().toString(36).substring(2, 15).replace(/[^a-z0-9]/gi, '');
  
  // Create a timestamp
  const timestamp = Date.now();
  
  // Return the secure filename
  return `${timestamp}_${randomString}.${safeExtension}`;
}; 