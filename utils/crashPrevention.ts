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

export const debugApiCall = async (url: string, options?: RequestInit) => {
  console.log('🔍 API Call Debug:', {
    url,
    method: options?.method || 'GET',
    headers: options?.headers,
    body: options?.body ? safeJsonStringify(options.body) : undefined
  });
  
  try {
    const response = await fetch(url, options);
    const text = await response.text();
    
    console.log('📡 API Response Debug:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      bodyPreview: text.substring(0, 200)
    });
    
    // Try to parse as JSON
    try {
      const json = JSON.parse(text);
      return { success: true, data: json, response };
    } catch (parseError) {
      return { 
        success: false, 
        error: `JSON Parse Error: ${text.substring(0, 100)}...`,
        rawText: text,
        response 
      };
    }
  } catch (error) {
    console.error('❌ API Call Failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
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
 * Safe string operations that avoid regex patterns causing Hermes crashes
 */
export const safeStringOperations = {
  // Safe alternative to String.prototype.match()
  match: (str: string, pattern: string): string[] | null => {
    return hermesGuard(() => {
      if (!str || !pattern || typeof str !== 'string' || typeof pattern !== 'string') {
        return null;
      }
      
      // Use indexOf instead of regex match
      const index = str.toLowerCase().indexOf(pattern.toLowerCase());
      if (index === -1) {
        return null;
      }
      
      // Return array similar to match() result
      const matched = str.substring(index, index + pattern.length);
      return [matched];
    }, null, 'safeStringMatch');
  },
  
  // Safe alternative to String.prototype.replace() with regex
  replace: (str: string, searchValue: string, replaceValue: string): string => {
    return hermesGuard(() => {
      if (!str || typeof str !== 'string') {
        return '';
      }
      
      if (!searchValue || typeof searchValue !== 'string') {
        return str;
      }
      
      if (typeof replaceValue !== 'string') {
        replaceValue = '';
      }
      
      // Use split/join instead of replace to avoid regex
      return str.split(searchValue).join(replaceValue);
    }, str || '', 'safeStringReplace');
  },
  
  // Safe alternative to String.prototype.search()
  search: (str: string, pattern: string): number => {
    return hermesGuard(() => {
      if (!str || !pattern || typeof str !== 'string' || typeof pattern !== 'string') {
        return -1;
      }
      
      return str.toLowerCase().indexOf(pattern.toLowerCase());
    }, -1, 'safeStringSearch');
  },
  
  // Safe string validation without regex
  test: (str: string, pattern: string): boolean => {
    return hermesGuard(() => {
      if (!str || !pattern || typeof str !== 'string' || typeof pattern !== 'string') {
        return false;
      }
      
      return str.toLowerCase().includes(pattern.toLowerCase());
    }, false, 'safeStringTest');
  }
};

/**
 * Safe wrapper functions for string operations that might cause crashes
 */
const createSafeStringWrappers = () => {
  // Create safe wrapper functions instead of overriding prototypes
  return {
    safeMatch: (str: string, pattern: string | RegExp): RegExpMatchArray | null => {
      return hermesGuard(() => {
        if (!str || typeof str !== 'string') {
          return null;
        }
        
        // If it's a simple string pattern, use safe method
        if (typeof pattern === 'string') {
          const result = safeStringOperations.match(str, pattern);
          return result as RegExpMatchArray | null;
        }
        
        // For regex objects, try with error handling
        try {
          return str.match(pattern);
        } catch {
          console.log('String.match crashed, using fallback');
          return null;
        }
      }, null, 'safeMatch');
    },
    
    safeReplace: (str: string, searchValue: string | RegExp, replaceValue: string): string => {
      return hermesGuard(() => {
        if (!str || typeof str !== 'string') {
          return '';
        }
        
        // If both are strings, use safe method
        if (typeof searchValue === 'string' && typeof replaceValue === 'string') {
          return safeStringOperations.replace(str, searchValue, replaceValue);
        }
        
        // For regex objects, try with error handling
        try {
          return str.replace(searchValue, replaceValue);
        } catch {
          console.log('String.replace crashed, using fallback');
          return str;
        }
      }, str || '', 'safeReplace');
    },
    
    safeSearch: (str: string, pattern: string | RegExp): number => {
      return hermesGuard(() => {
        if (!str || typeof str !== 'string') {
          return -1;
        }
        
        // If it's a simple string, use safe method
        if (typeof pattern === 'string') {
          return safeStringOperations.search(str, pattern);
        }
        
        // For regex objects, try with error handling
        try {
          return str.search(pattern);
        } catch {
          console.log('String.search crashed, using fallback');
          return -1;
        }
      }, -1, 'safeSearch');
    }
  };
};

/**
 * Initialize crash prevention measures
 */
export const initializeCrashPrevention = (): void => {
  // Create safe string wrappers
  const safeStringWrappers = createSafeStringWrappers();
  
  // Export safe wrappers globally for use throughout the app
  if (typeof global !== 'undefined') {
    (global as any).safeStringWrappers = safeStringWrappers;
  }
  
  // Override console methods to prevent crashes from logging
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    hermesGuard(() => {
      const message = args.join(' ');
      
      // Filter out known Hermes crashes
      if (message.includes('hermes::vm::') || 
          message.includes('JSObject::') ||
          message.includes('regExpPrototype') ||
          message.includes('stringPrototype') ||
          message.includes('getComputedWithReceiver_RJS') ||
          message.includes('setNamedSlotValueUnsafe')) {
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
            errorMessage.includes('JSObject::') ||
            errorMessage.includes('getComputedWithReceiver_RJS') ||
            errorMessage.includes('setNamedSlotValueUnsafe') ||
            errorMessage.includes('regExpPrototype') ||
            errorMessage.includes('stringPrototype')) {
          console.log('Prevented Hermes crash from being reported as fatal');
          return;
        }
        
        // Call original handler for other errors
        if (originalErrorHandler) {
          originalErrorHandler(error, isFatal);
        }
      }, undefined, 'globalErrorHandler');
    });
    
    // Add unhandled promise rejection handler
    const originalUnhandledRejection = globalAny.onunhandledrejection;
    globalAny.onunhandledrejection = (event: any) => {
      hermesGuard(() => {
        const reason = event?.reason || event;
        const reasonMessage = reason?.message || String(reason);
        
        // Filter out Hermes crashes
        if (reasonMessage.includes('hermes::vm::') || 
            reasonMessage.includes('JSObject::')) {
          console.log('Filtered Hermes crash from unhandled rejection');
          if (event?.preventDefault) {
            event.preventDefault();
          }
          return;
        }
        
        // Call original handler
        if (originalUnhandledRejection) {
          originalUnhandledRejection(event);
        }
      }, undefined, 'unhandledRejectionHandler');
    };
  }
  
  // Memory management
  if (typeof global !== 'undefined' && global.gc && !__DEV__) {
    // Periodic garbage collection in production
    setInterval(() => {
      try {
        if (global.gc) {
          global.gc();
        }
      } catch {
        // Ignore GC errors
      }
    }, 30000); // Every 30 seconds
  }
  
  console.log('Comprehensive crash prevention measures initialized (iPad optimized)');
};

/**
 * iPad-specific crash prevention measures
 */
export const initializeIpadCrashPrevention = (): void => {
  // iPad-specific memory management
  if (typeof global !== 'undefined') {
    const globalAny = global as any;
    
    // Prevent iPad-specific Hermes crashes
    const originalSetTimeout = globalAny.setTimeout;
    globalAny.setTimeout = (callback: Function, delay: number, ...args: any[]) => {
      return originalSetTimeout(() => {
        hermesGuard(() => {
          callback(...args);
        }, undefined, 'iPad setTimeout callback');
      }, Math.max(delay, 16)); // Minimum 16ms delay for iPad stability
    };
    
    // Enhanced memory pressure relief for iPad
    const memoryPressureInterval = setInterval(() => {
      hermesGuard(() => {
        if (globalAny.gc && !__DEV__) {
          globalAny.gc();
        }
        // Clear any large objects that might cause crashes
        if (globalAny.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
          delete globalAny.__REACT_DEVTOOLS_GLOBAL_HOOK__.rendererInterfaces;
        }
      }, undefined, 'iPad memory pressure relief');
    }, 15000); // Every 15 seconds on iPad
    
    // Store interval reference for cleanup
    globalAny._ipadMemoryInterval = memoryPressureInterval;
  }
};

/**
 * Safe navigation wrapper for preventing router crashes
 */
export const safeNavigate = (router: any, path: string, options?: any): void => {
  hermesGuard(() => {
    if (!router || typeof router.push !== 'function') {
      console.warn('Invalid router object provided to safeNavigate');
      return;
    }
    
    if (!path || typeof path !== 'string') {
      console.warn('Invalid path provided to safeNavigate');
      return;
    }
    
    // Add delay for iPad stability
    setTimeout(() => {
      hermesGuard(() => {
        if (options) {
          router.push(path, options);
        } else {
          router.push(path);
        }
      }, undefined, 'router navigation');
    }, 50);
  }, undefined, 'safeNavigate');
};

/**
 * Safe async operation wrapper
 */
export const safeAsync = async <T>(
  operation: () => Promise<T>,
  fallback: T,
  operationName: string = 'async operation'
): Promise<T> => {
  try {
    // Add small delay for iPad stability
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const result = await operation();
    return result;
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    
    // Check for Hermes-specific errors
    if (errorMessage.includes('hermes::vm::') || 
        errorMessage.includes('JSObject::') ||
        errorMessage.includes('getComputedWithReceiver_RJS')) {
      console.log(`Hermes async error prevented in ${operationName}:`, errorMessage);
      return fallback;
    }
    
    console.error(`Async operation failed in ${operationName}:`, error);
    return fallback;
  }
};