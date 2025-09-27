/**
 * Manual environment variable loader for Expo
 * This ensures environment variables are available even if .env file loading fails
 */

// Production environment variables
const PRODUCTION_ENV = {
  EXPO_PUBLIC_API_URL: 'https://zestapp.online/api',
  EXPO_PUBLIC_TRPC_URL: 'https://zestapp.online/api/trpc',
  EXPO_PUBLIC_BASE_URL: 'https://zestapp.online',
} as const;

// Development environment variables
const DEVELOPMENT_ENV = {
  EXPO_PUBLIC_API_URL: 'http://localhost:3001/api',
  EXPO_PUBLIC_TRPC_URL: 'http://localhost:3001/api/trpc',
  EXPO_PUBLIC_BASE_URL: 'http://localhost:3001',
} as const;

/**
 * Load environment variables with fallbacks
 * This function ensures that environment variables are always available
 */
export const loadEnvironmentVariables = () => {
  const isDevelopment = __DEV__;
  const fallbackEnv = isDevelopment ? DEVELOPMENT_ENV : PRODUCTION_ENV;
  
  // Check if environment variables are already loaded
  const hasEnvVars = process.env.EXPO_PUBLIC_API_URL && 
                     process.env.EXPO_PUBLIC_TRPC_URL && 
                     process.env.EXPO_PUBLIC_BASE_URL;
  
  if (!hasEnvVars) {
    console.log('⚠️ Environment variables not loaded, using fallbacks');
    
    // Manually set environment variables
    Object.entries(fallbackEnv).forEach(([key, value]) => {
      if (!process.env[key]) {
        // @ts-ignore - We need to set process.env values
        process.env[key] = value;
        console.log(`✅ Set ${key} = ${value}`);
      }
    });
  } else {
    console.log('✅ Environment variables already loaded');
  }
  
  return {
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL || fallbackEnv.EXPO_PUBLIC_API_URL,
    EXPO_PUBLIC_TRPC_URL: process.env.EXPO_PUBLIC_TRPC_URL || fallbackEnv.EXPO_PUBLIC_TRPC_URL,
    EXPO_PUBLIC_BASE_URL: process.env.EXPO_PUBLIC_BASE_URL || fallbackEnv.EXPO_PUBLIC_BASE_URL,
  };
};

// Auto-load environment variables when this module is imported
loadEnvironmentVariables();