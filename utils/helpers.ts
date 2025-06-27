import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Formats a number with commas as thousands separators
 */
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Formats a date to a readable string
 */
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Formats a time to a readable string
 */
export const formatTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
};

/**
 * Formats a date and time to a readable string
 */
export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return `${formatDate(d)} at ${formatTime(d)}`;
};

/**
 * Truncates a string to a specified length and adds ellipsis
 */
export const truncateString = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};

/**
 * Calculates time remaining from now until a target date
 * Returns an object with days, hours, minutes, seconds
 */
export const getTimeRemaining = (endDate: Date | string) => {
  const total = new Date(endDate).getTime() - new Date().getTime();
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  
  return {
    total,
    days,
    hours,
    minutes,
    seconds
  };
};

/**
 * Formats a time remaining object into a readable string
 */
export const formatTimeRemaining = (timeRemaining: ReturnType<typeof getTimeRemaining>): string => {
  if (timeRemaining.total <= 0) {
    return "Expired";
  }
  
  if (timeRemaining.days > 0) {
    return `${timeRemaining.days}d ${timeRemaining.hours}h remaining`;
  }
  
  if (timeRemaining.hours > 0) {
    return `${timeRemaining.hours}h ${timeRemaining.minutes}m remaining`;
  }
  
  return `${timeRemaining.minutes}m ${timeRemaining.seconds}s remaining`;
};

/**
 * Generates a random ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Clears all AsyncStorage data
 * Returns a promise that resolves when the operation is complete
 */
export const clearAllStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
    console.log('Storage successfully cleared!');
  } catch (error) {
    console.error('Error clearing AsyncStorage:', error);
    throw error;
  }
};

/**
 * Removes specific keys from AsyncStorage
 * Returns a promise that resolves when the operation is complete
 */
export const removeStorageItems = async (keys: string[]): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(keys);
    console.log('Storage items successfully removed!');
  } catch (error) {
    console.error('Error removing items from AsyncStorage:', error);
    throw error;
  }
};

/**
 * Safely removes specific keys from AsyncStorage
 * Doesn't throw errors if keys don't exist or removal fails
 */
export const safeRemoveStorageItems = async (keys: string[]): Promise<void> => {
  try {
    // Filter out keys that don't exist
    const existingKeys: string[] = [];
    
    for (const key of keys) {
      try {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
          existingKeys.push(key);
        }
      } catch (e) {
        // Skip keys that cause errors
        console.log(`Key ${key} check failed, skipping`);
      }
    }
    
    // Only remove keys that exist
    if (existingKeys.length > 0) {
      await AsyncStorage.multiRemove(existingKeys);
      console.log('Storage items successfully removed:', existingKeys);
    } else {
      console.log('No storage items to remove');
    }
  } catch (error) {
    console.error('Error safely removing items from AsyncStorage:', error);
    // Don't throw, just log the error
  }
};

/**
 * Validates an email address
 */
export const isValidEmail = (email: string): boolean => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email.toLowerCase());
};

/**
 * Validates a phone number (simple validation)
 */
export const isValidPhone = (phone: string): boolean => {
  const re = /^\+?[0-9]{10,15}$/;
  return re.test(phone);
};

/**
 * Formats a currency amount
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formats a number in compact form (e.g., 1.2k, 5.3M)
 */
export const formatCompactNumber = (num: number): string => {
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(num);
};

/**
 * Calculates percentage
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

/**
 * Debounce function to limit how often a function can be called
 */
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
): ((...args: Parameters<F>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
};

/**
 * Throttle function to limit how often a function can be called
 */
export const throttle = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
): ((...args: Parameters<F>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastCall = 0;
  
  return (...args: Parameters<F>): void => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;
    
    if (timeSinceLastCall >= waitFor) {
      func(...args);
      lastCall = now;
    } else {
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      
      timeout = setTimeout(() => {
        func(...args);
        lastCall = Date.now();
      }, waitFor - timeSinceLastCall);
    }
  };
};