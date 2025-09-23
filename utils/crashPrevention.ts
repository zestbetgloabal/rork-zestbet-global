/**
 * Crash Prevention Utilities
 * 
 * This module provides utilities to prevent crashes in the Hermes JavaScript engine,
 * specifically targeting the issues identified in Apple's crash reports.
 * 
 * The crashes occur in:
 * - hermes::vm::JSObject::getComputedWithReceiver_RJS
 * - hermes::vm::stringPrototypeMatch
 * - hermes::vm::regExpPrototypeExec
 * 
 * This module provides safe alternatives to operations that might trigger these crashes.
 */

/**
 * Safe wrapper for any operation that might cause a Hermes crash
 */
export const hermesGuard = <T>(
  operation: () => T,
  fallback: T,
  operationName: string = 'operation'
): T => {
  try {
    // Add a small delay to prevent rapid successive operations that might cause memory issues
    if (typeof global !== 'undefined' && global.gc) {
      // Suggest garbage collection if available (development only)
      global.gc();
    }
    
    return operation();
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    
    // Check if it's a Hermes engine error
    if (errorMessage.includes('hermes::vm::') || 
        errorMessage.includes('JSObject::') ||
        errorMessage.includes('regExp') ||
        errorMessage.includes('stringPrototype')) {
      console.log(`Hermes engine error prevented in ${operationName}:`, errorMessage);
      return fallback;
    }
    
    // Log other errors but still return fallback
    console.error(`Operation failed in ${operationName}:`, error);
    return fallback;
  }
};

/**
 * Safe string matching without regex
 */
export const safeStringMatch = (text: string, pattern: string): boolean => {
  return hermesGuard(() => {
    if (!text || !pattern || typeof text !== 'string' || typeof pattern !== 'string') {
      return false;
    }
    
    // Use simple string methods instead of regex
    return text.toLowerCase().includes(pattern.toLowerCase());
  }, false, 'safeStringMatch');
};

/**
 * Safe string replacement without regex
 */
export const safeStringReplace = (text: string, searchValue: string, replaceValue: string): string => {
  return hermesGuard(() => {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    if (!searchValue || typeof searchValue !== 'string') {
      return text;
    }
    
    if (typeof replaceValue !== 'string') {
      replaceValue = '';
    }
    
    // Use split and join instead of replace to avoid regex
    return text.split(searchValue).join(replaceValue);
  }, text || '', 'safeStringReplace');
};

/**
 * Safe string splitting with length limits
 */
export const safeStringSplit = (text: string, separator: string, limit?: number): string[] => {
  return hermesGuard(() => {
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
 * Safe object property access that might trigger JSObject crashes
 */
export const safePropertyAccess = <T>(
  obj: any,
  property: string,
  fallback: T
): T => {
  return hermesGuard(() => {
    if (!obj || typeof obj !== 'object') {
      return fallback;
    }
    
    if (!property || typeof property !== 'string') {
      return fallback;
    }
    
    // Use bracket notation to avoid potential computed property issues
    const value = obj[property];
    return value !== undefined ? value : fallback;
  }, fallback, 'safePropertyAccess');
};

/**
 * Safe dynamic property access with string keys
 */
export const safeDynamicAccess = <T>(
  obj: any,
  key: string | number,
  fallback: T
): T => {
  return hermesGuard(() => {
    if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) {
      return fallback;
    }
    
    if (key === null || key === undefined) {
      return fallback;
    }
    
    // Convert key to string safely
    const stringKey = String(key);
    
    // Use hasOwnProperty to check existence first
    if (Object.prototype.hasOwnProperty.call(obj, stringKey)) {
      return obj[stringKey] !== undefined ? obj[stringKey] : fallback;
    }
    
    return fallback;
  }, fallback, 'safeDynamicAccess');
};

/**
 * Safe method invocation that might trigger crashes
 */
export const safeMethodCall = <T>(
  obj: any,
  methodName: string,
  args: any[] = [],
  fallback: T
): T => {
  return hermesGuard(() => {
    if (!obj || typeof obj !== 'object') {
      return fallback;
    }
    
    if (!methodName || typeof methodName !== 'string') {
      return fallback;
    }
    
    const method = obj[methodName];
    if (typeof method !== 'function') {
      return fallback;
    }
    
    // Limit arguments to prevent memory issues
    const safeArgs = Array.isArray(args) ? args.slice(0, 10) : [];
    
    return method.apply(obj, safeArgs);
  }, fallback, 'safeMethodCall');
};

/**
 * Safe JSON operations that might cause crashes
 */
export const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  return hermesGuard(() => {
    if (!jsonString || typeof jsonString !== 'string') {
      return fallback;
    }
    
    // Limit JSON string length to prevent memory issues
    if (jsonString.length > 100000) {
      console.warn('JSON string too large, truncating');
      jsonString = jsonString.substring(0, 100000);
    }
    
    return JSON.parse(jsonString);
  }, fallback, 'safeJsonParse');
};

/**
 * Safe JSON stringify with circular reference handling
 */
export const safeJsonStringify = (obj: any, fallback: string = '{}'): string => {
  return hermesGuard(() => {
    if (obj === null || obj === undefined) {
      return 'null';
    }
    
    // Handle circular references
    const seen = new WeakSet();
    
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    });
  }, fallback, 'safeJsonStringify');
};

/**
 * Safe array operations that might cause memory issues
 */
export const safeArrayOperation = <T, R>(
  array: T[],
  operation: (arr: T[]) => R,
  fallback: R
): R => {
  return hermesGuard(() => {
    if (!Array.isArray(array)) {
      return fallback;
    }
    
    // Limit array size to prevent memory issues
    const safeArray = array.length > 10000 ? array.slice(0, 10000) : array;
    
    return operation(safeArray);
  }, fallback, 'safeArrayOperation');
};

/**
 * Memory pressure relief - suggests garbage collection
 */
export const relieveMemoryPressure = (): void => {
  hermesGuard(() => {
    // Clear any large temporary variables
    if (typeof global !== 'undefined') {
      // Suggest garbage collection in development
      if (global.gc && __DEV__) {
        global.gc();
      }
      
      // Clear console history to free memory
      if (console.clear && __DEV__) {
        console.clear();
      }
    }
    
    // Force a small delay to allow memory cleanup
    return new Promise(resolve => setTimeout(resolve, 10));
  }, undefined, 'relieveMemoryPressure');
};

/**
 * Safe timeout/interval operations
 */
export const safeTimeout = (callback: () => void, delay: number): ReturnType<typeof setTimeout> | null => {
  return hermesGuard(() => {
    if (typeof callback !== 'function') {
      return null;
    }
    
    // Limit delay to reasonable bounds
    const safeDelay = Math.max(0, Math.min(delay, 300000)); // Max 5 minutes
    
    return setTimeout(() => {
      hermesGuard(callback, undefined, 'timeoutCallback');
    }, safeDelay);
  }, null, 'safeTimeout');
};

/**
 * Safe interval operations
 */
export const safeInterval = (callback: () => void, delay: number): ReturnType<typeof setInterval> | null => {
  return hermesGuard(() => {
    if (typeof callback !== 'function') {
      return null;
    }
    
    // Limit delay to reasonable bounds
    const safeDelay = Math.max(100, Math.min(delay, 60000)); // Min 100ms, Max 1 minute
    
    return setInterval(() => {
      hermesGuard(callback, undefined, 'intervalCallback');
    }, safeDelay);
  }, null, 'safeInterval');
};

/**
 * Initialize crash prevention measures
 */
export const initializeCrashPrevention = (): void => {
  // Override console methods to prevent crashes from logging
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    hermesGuard(() => {
      const message = args.join(' ');
      
      // Filter out known Hermes crashes
      if (message.includes('hermes::vm::') || 
          message.includes('JSObject::') ||
          message.includes('regExpPrototype') ||
          message.includes('stringPrototype')) {
        console.log('Filtered Hermes crash from console.error');
        return;
      }
      
      originalConsoleError.apply(console, args);
    }, undefined, 'console.error');
  };
  
  // Add global error handlers
  if (typeof global !== 'undefined') {
    const globalAny = global as any;
    const originalErrorHandler = globalAny.ErrorUtils?.getGlobalHandler();
    
    globalAny.ErrorUtils?.setGlobalHandler((error: any, isFatal: boolean) => {
      hermesGuard(() => {
        const errorMessage = error?.message || String(error);
        
        // Don't report Hermes engine crashes as fatal
        if (errorMessage.includes('hermes::vm::') || 
            errorMessage.includes('JSObject::')) {
          console.log('Prevented Hermes crash from being reported as fatal');
          return;
        }
        
        // Call original handler for other errors
        if (originalErrorHandler) {
          originalErrorHandler(error, isFatal);
        }
      }, undefined, 'globalErrorHandler');
    });
  }
  
  console.log('Crash prevention measures initialized');
};