/**
 * String Safety Utilities
 * 
 * This module provides safe string operations that avoid regex patterns
 * to prevent crashes in the Hermes JavaScript engine.
 * 
 * All functions in this module use simple string manipulation methods
 * instead of regular expressions to ensure stability on iOS devices.
 */

/**
 * Safely sanitizes a string by removing potentially problematic characters
 */
export const sanitizeString = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Limit string length to prevent memory issues
  const maxLength = 10000;
  let sanitized = input.length > maxLength ? input.substring(0, maxLength) : input;
  
  // Remove null bytes and other control characters manually
  let result = '';
  for (let i = 0; i < sanitized.length; i++) {
    const char = sanitized[i];
    const charCode = char.charCodeAt(0);
    
    // Skip control characters except common whitespace
    if (charCode < 32 && charCode !== 9 && charCode !== 10 && charCode !== 13) {
      continue;
    }
    
    result += char;
  }
  
  return result;
};

/**
 * Safely validates email format without regex
 */
export const validateEmailSafe = (email: string): boolean => {
  try {
    if (!email || typeof email !== 'string') {
      return false;
    }
    
    const sanitized = sanitizeString(email.toLowerCase().trim());
    if (sanitized.length < 5 || sanitized.length > 254) {
      return false;
    }
    
    // Split by @ and validate parts
    const parts = sanitized.split('@');
    if (parts.length !== 2) {
      return false;
    }
    
    const [local, domain] = parts;
    if (!local || !domain || local.length < 1 || local.length > 64) {
      return false;
    }
    
    // Check domain has at least one dot
    if (!domain.includes('.') || domain.length < 4) {
      return false;
    }
    
    // Check for invalid characters in local part
    const invalidLocalChars = ['<', '>', '(', ')', '[', ']', '\\', ',', ';', ':', ' ', '"', '\''];
    for (const char of invalidLocalChars) {
      if (local.includes(char)) {
        return false;
      }
    }
    
    // Check for invalid characters in domain
    const invalidDomainChars = ['<', '>', '(', ')', '[', ']', '\\', ',', ';', ':', ' ', '"', '\'', '_'];
    for (const char of invalidDomainChars) {
      if (domain.includes(char)) {
        return false;
      }
    }
    
    // Check domain ends with valid TLD (at least 2 chars after last dot)
    const domainParts = domain.split('.');
    const tld = domainParts[domainParts.length - 1];
    if (!tld || tld.length < 2) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Email validation error:', error);
    return false;
  }
};

/**
 * Safely validates phone number format without regex
 */
export const validatePhoneSafe = (phone: string): boolean => {
  try {
    if (!phone || typeof phone !== 'string') {
      return false;
    }
    
    const sanitized = sanitizeString(phone.trim());
    if (sanitized.length < 10 || sanitized.length > 20) {
      return false;
    }
    
    // Extract only digits and + sign
    let cleanPhone = '';
    for (const char of sanitized) {
      if (char === '+' || (char >= '0' && char <= '9')) {
        cleanPhone += char;
      }
    }
    
    // Validate format
    if (cleanPhone.startsWith('+')) {
      const digits = cleanPhone.substring(1);
      if (digits.length < 10 || digits.length > 15) {
        return false;
      }
      // Ensure all remaining characters are digits
      for (const char of digits) {
        if (char < '0' || char > '9') {
          return false;
        }
      }
    } else {
      if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        return false;
      }
      // Ensure all characters are digits
      for (const char of cleanPhone) {
        if (char < '0' || char > '9') {
          return false;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Phone validation error:', error);
    return false;
  }
};

/**
 * Safely extracts numbers from a string without regex
 */
export const extractNumbersSafe = (input: string): string => {
  try {
    if (!input || typeof input !== 'string') {
      return '';
    }
    
    const sanitized = sanitizeString(input);
    let numbers = '';
    
    for (const char of sanitized) {
      if (char >= '0' && char <= '9') {
        numbers += char;
      }
    }
    
    return numbers;
  } catch (error) {
    console.error('Number extraction error:', error);
    return '';
  }
};

/**
 * Safely checks if a string contains only alphanumeric characters
 */
export const isAlphanumericSafe = (input: string): boolean => {
  try {
    if (!input || typeof input !== 'string') {
      return false;
    }
    
    const sanitized = sanitizeString(input);
    
    for (const char of sanitized) {
      const isLetter = (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
      const isDigit = char >= '0' && char <= '9';
      
      if (!isLetter && !isDigit) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Alphanumeric check error:', error);
    return false;
  }
};

/**
 * Safely removes HTML tags without regex
 */
export const stripHtmlSafe = (input: string): string => {
  try {
    if (!input || typeof input !== 'string') {
      return '';
    }
    
    const sanitized = sanitizeString(input);
    let result = '';
    let insideTag = false;
    
    for (const char of sanitized) {
      if (char === '<') {
        insideTag = true;
      } else if (char === '>') {
        insideTag = false;
      } else if (!insideTag) {
        result += char;
      }
    }
    
    return result.trim();
  } catch (error) {
    console.error('HTML strip error:', error);
    return input || '';
  }
};

/**
 * Safely formats a string for display (truncate and clean)
 */
export const formatDisplayStringSafe = (input: string, maxLength: number = 100): string => {
  try {
    if (!input || typeof input !== 'string') {
      return '';
    }
    
    const sanitized = sanitizeString(input.trim());
    
    if (sanitized.length <= maxLength) {
      return sanitized;
    }
    
    return sanitized.substring(0, maxLength - 3) + '...';
  } catch (error) {
    console.error('Display string format error:', error);
    return '';
  }
};

/**
 * Safely checks if a string is a valid URL without regex
 */
export const isValidUrlSafe = (input: string): boolean => {
  try {
    if (!input || typeof input !== 'string') {
      return false;
    }
    
    const sanitized = sanitizeString(input.toLowerCase().trim());
    
    // Check for basic URL structure
    if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
      return false;
    }
    
    // Remove protocol
    const withoutProtocol = sanitized.startsWith('https://') 
      ? sanitized.substring(8) 
      : sanitized.substring(7);
    
    // Check for domain
    if (withoutProtocol.length < 4 || !withoutProtocol.includes('.')) {
      return false;
    }
    
    // Check for invalid characters
    const invalidChars = [' ', '<', '>', '"', '\'', '\\'];
    for (const char of invalidChars) {
      if (withoutProtocol.includes(char)) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('URL validation error:', error);
    return false;
  }
};

/**
 * Global string operation wrapper that catches any potential crashes
 */
export const safeStringOperation = <T>(
  operation: () => T,
  fallback: T,
  operationName: string = 'string operation'
): T => {
  try {
    return operation();
  } catch (error) {
    console.error(`Safe string operation failed (${operationName}):`, error);
    return fallback;
  }
};

/**
 * Memory-safe string comparison
 */
export const safeStringCompare = (str1: string, str2: string): boolean => {
  try {
    if (typeof str1 !== 'string' || typeof str2 !== 'string') {
      return false;
    }
    
    // Limit comparison length to prevent memory issues
    const maxLength = 1000;
    const s1 = str1.length > maxLength ? str1.substring(0, maxLength) : str1;
    const s2 = str2.length > maxLength ? str2.substring(0, maxLength) : str2;
    
    return s1 === s2;
  } catch (error) {
    console.error('String comparison error:', error);
    return false;
  }
};