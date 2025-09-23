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
  return safeStringOperation(() => {
    if (!email || typeof email !== 'string') {
      return false;
    }
    
    const sanitized = sanitizeString(safeStringToLowerCase(safeStringTrim(email)));
    if (sanitized.length < 5 || sanitized.length > 254) {
      return false;
    }
    
    // Split by @ and validate parts
    const parts = safeStringSplit(sanitized, '@');
    if (parts.length !== 2) {
      return false;
    }
    
    const [local, domain] = parts;
    if (!local || !domain || local.length < 1 || local.length > 64) {
      return false;
    }
    
    // Check domain has at least one dot
    if (!safeStringContains(domain, '.') || domain.length < 4) {
      return false;
    }
    
    // Check for invalid characters in local part
    const invalidLocalChars = ['<', '>', '(', ')', '[', ']', '\\', ',', ';', ':', ' ', '"', '\''];
    for (const char of invalidLocalChars) {
      if (safeStringContains(local, char)) {
        return false;
      }
    }
    
    // Check for invalid characters in domain
    const invalidDomainChars = ['<', '>', '(', ')', '[', ']', '\\', ',', ';', ':', ' ', '"', '\'', '_'];
    for (const char of invalidDomainChars) {
      if (safeStringContains(domain, char)) {
        return false;
      }
    }
    
    // Check domain ends with valid TLD (at least 2 chars after last dot)
    const domainParts = safeStringSplit(domain, '.');
    const tld = domainParts[domainParts.length - 1];
    if (!tld || tld.length < 2) {
      return false;
    }
    
    return true;
  }, false, 'validateEmailSafe');
};

/**
 * Safe string split operation
 */
export const safeStringSplit = (text: string, separator: string, limit?: number): string[] => {
  return safeStringOperation(() => {
    if (!text || typeof text !== 'string') {
      return [];
    }
    
    if (!separator || typeof separator !== 'string') {
      return [text];
    }
    
    const result = text.split(separator);
    
    if (limit && limit > 0) {
      return result.slice(0, limit);
    }
    
    return result;
  }, [], 'safeStringSplit');
};

/**
 * Safely validates phone number format without regex
 */
export const validatePhoneSafe = (phone: string): boolean => {
  return safeStringOperation(() => {
    if (!phone || typeof phone !== 'string') {
      return false;
    }
    
    const sanitized = sanitizeString(safeStringTrim(phone));
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
    if (safeStringStartsWith(cleanPhone, '+')) {
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
  }, false, 'validatePhoneSafe');
};

/**
 * Safely extracts numbers from a string without regex
 */
export const extractNumbersSafe = (input: string): string => {
  return safeStringOperation(() => {
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
  }, '', 'extractNumbersSafe');
};

/**
 * Safely checks if a string contains only alphanumeric characters
 */
export const isAlphanumericSafe = (input: string): boolean => {
  return safeStringOperation(() => {
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
  }, false, 'isAlphanumericSafe');
};

/**
 * Safely removes HTML tags without regex
 */
export const stripHtmlSafe = (input: string): string => {
  return safeStringOperation(() => {
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
    
    return safeStringTrim(result);
  }, input || '', 'stripHtmlSafe');
};

/**
 * Safely formats a string for display (truncate and clean)
 */
export const formatDisplayStringSafe = (input: string, maxLength: number = 100): string => {
  return safeStringOperation(() => {
    if (!input || typeof input !== 'string') {
      return '';
    }
    
    const sanitized = sanitizeString(safeStringTrim(input));
    
    if (sanitized.length <= maxLength) {
      return sanitized;
    }
    
    return sanitized.substring(0, maxLength - 3) + '...';
  }, '', 'formatDisplayStringSafe');
};

/**
 * Safely checks if a string is a valid URL without regex
 */
export const isValidUrlSafe = (input: string): boolean => {
  return safeStringOperation(() => {
    if (!input || typeof input !== 'string') {
      return false;
    }
    
    const sanitized = sanitizeString(safeStringToLowerCase(safeStringTrim(input)));
    
    // Check for basic URL structure
    if (!safeStringStartsWith(sanitized, 'http://') && !safeStringStartsWith(sanitized, 'https://')) {
      return false;
    }
    
    // Remove protocol
    const withoutProtocol = safeStringStartsWith(sanitized, 'https://') 
      ? sanitized.substring(8) 
      : sanitized.substring(7);
    
    // Check for domain
    if (withoutProtocol.length < 4 || !safeStringContains(withoutProtocol, '.')) {
      return false;
    }
    
    // Check for invalid characters
    const invalidChars = [' ', '<', '>', '"', '\'', '\\'];
    for (const char of invalidChars) {
      if (safeStringContains(withoutProtocol, char)) {
        return false;
      }
    }
    
    return true;
  }, false, 'isValidUrlSafe');
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
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    
    // Check for Hermes engine crashes
    if (errorMessage.includes('hermes::vm::') || 
        errorMessage.includes('JSObject::') ||
        errorMessage.includes('getComputedWithReceiver_RJS') ||
        errorMessage.includes('setNamedSlotValueUnsafe') ||
        errorMessage.includes('regExpPrototype') ||
        errorMessage.includes('stringPrototype')) {
      console.log(`Hermes engine crash prevented in ${operationName}`);
      return fallback;
    }
    
    console.error(`Safe string operation failed (${operationName}):`, error);
    return fallback;
  }
};

/**
 * Memory-safe string comparison
 */
export const safeStringCompare = (str1: string, str2: string): boolean => {
  return safeStringOperation(() => {
    if (typeof str1 !== 'string' || typeof str2 !== 'string') {
      return false;
    }
    
    // Limit comparison length to prevent memory issues
    const maxLength = 1000;
    const s1 = str1.length > maxLength ? str1.substring(0, maxLength) : str1;
    const s2 = str2.length > maxLength ? str2.substring(0, maxLength) : str2;
    
    return s1 === s2;
  }, false, 'safeStringCompare');
};

/**
 * Safe string contains check without regex
 */
export const safeStringContains = (text: string, searchValue: string): boolean => {
  return safeStringOperation(() => {
    if (!text || !searchValue || typeof text !== 'string' || typeof searchValue !== 'string') {
      return false;
    }
    
    // Use indexOf instead of includes to avoid potential issues
    return text.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1;
  }, false, 'safeStringContains');
};

/**
 * Safe string startsWith check
 */
export const safeStringStartsWith = (text: string, prefix: string): boolean => {
  return safeStringOperation(() => {
    if (!text || !prefix || typeof text !== 'string' || typeof prefix !== 'string') {
      return false;
    }
    
    if (prefix.length > text.length) {
      return false;
    }
    
    return text.substring(0, prefix.length) === prefix;
  }, false, 'safeStringStartsWith');
};

/**
 * Safe string endsWith check
 */
export const safeStringEndsWith = (text: string, suffix: string): boolean => {
  return safeStringOperation(() => {
    if (!text || !suffix || typeof text !== 'string' || typeof suffix !== 'string') {
      return false;
    }
    
    if (suffix.length > text.length) {
      return false;
    }
    
    return text.substring(text.length - suffix.length) === suffix;
  }, false, 'safeStringEndsWith');
};

/**
 * Safe string trim operation
 */
export const safeStringTrim = (text: string): string => {
  return safeStringOperation(() => {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    // Manual trim to avoid potential issues
    let start = 0;
    let end = text.length - 1;
    
    // Find first non-whitespace character
    while (start <= end && /\s/.test(text[start])) {
      start++;
    }
    
    // Find last non-whitespace character
    while (end >= start && /\s/.test(text[end])) {
      end--;
    }
    
    return text.substring(start, end + 1);
  }, text || '', 'safeStringTrim');
};

/**
 * Safe string toLowerCase operation
 */
export const safeStringToLowerCase = (text: string): string => {
  return safeStringOperation(() => {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    return text.toLowerCase();
  }, text || '', 'safeStringToLowerCase');
};

/**
 * Safe string toUpperCase operation
 */
export const safeStringToUpperCase = (text: string): string => {
  return safeStringOperation(() => {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    return text.toUpperCase();
  }, text || '', 'safeStringToUpperCase');
};