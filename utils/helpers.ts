// Add these helper functions if they don't exist in your utils/helpers.ts file

/**
 * Generates a random ID string
 */
export function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Formats a date to a readable string (e.g., "Jan 1, 2023")
 */
export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Formats a date and time to a readable string (e.g., "Jan 1, 2023, 3:00 PM")
 */
export function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Formats a number to a compact representation (e.g., 1.2K, 3.4M)
 */
export function formatCompactNumber(num: number): string {
  if (num < 1000) {
    return num.toString();
  } else if (num < 1000000) {
    return (num / 1000).toFixed(1) + 'K';
  } else {
    return (num / 1000000).toFixed(1) + 'M';
  }
}

/**
 * Formats a currency value
 */
export function formatCurrency(amount: number): string {
  return '$' + amount.toFixed(2);
}

/**
 * Calculates time remaining from now until a future date
 */
export function getTimeRemaining(date: Date) {
  const total = new Date(date).getTime() - new Date().getTime();
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
}