/**
 * Server-side content validation utilities
 */

/**
 * Validates that content has at least 3 words
 * @param content The content to validate
 * @returns True if the content is valid, false otherwise
 */
export function validateMinimumWords(content: string): boolean {
  if (!content) return false;
  
  const words = content.trim().split(/\s+/);
  return words.length >= 3 && words[0] !== '';
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html The HTML content to sanitize
 * @returns Sanitized HTML content
 */
export function sanitizeHtml(html: string): string {
  // This is a simple implementation
  // In a production environment, use a library like DOMPurify or sanitize-html
  
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove onclick, onload, and other event handlers
  sanitized = sanitized.replace(/ on\w+="[^"]*"/gi, '');
  sanitized = sanitized.replace(/ on\w+='[^']*'/gi, '');
  sanitized = sanitized.replace(/ on\w+=\w+/gi, '');
  
  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:[^\s"']+/gi, '');
  
  return sanitized;
}

/**
 * Validates and sanitizes content
 * @param content The content to validate and sanitize
 * @returns An object with validation result and sanitized content
 */
export function validateAndSanitizeContent(content: string): { 
  valid: boolean; 
  sanitized: string;
  error?: string;
} {
  // Check if content exists
  if (!content) {
    return {
      valid: false,
      sanitized: '',
      error: 'Content is required'
    };
  }
  
  // Check minimum words
  if (!validateMinimumWords(content)) {
    return {
      valid: false,
      sanitized: content,
      error: 'Content must contain at least 3 words'
    };
  }
  
  // Sanitize HTML
  const sanitized = sanitizeHtml(content);
  
  return {
    valid: true,
    sanitized
  };
} 