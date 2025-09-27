import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Configuration helper for environment variables in Expo
 * This handles the different ways environment variables can be accessed in Expo apps
 */

export interface AppConfig {
  apiUrl: string;
  trpcUrl: string;
  baseUrl: string;
  isDevelopment: boolean;
  platform: string;
}

/**
 * Get environment variable from multiple sources
 * Expo apps can access environment variables in different ways:
 * 1. process.env (for EXPO_PUBLIC_ prefixed variables)
 * 2. Constants.expoConfig.extra (configured in app.json)
 * 3. Fallback values
 */
const getEnvVar = (key: 'EXPO_PUBLIC_API_URL' | 'EXPO_PUBLIC_TRPC_URL' | 'EXPO_PUBLIC_BASE_URL', fallback?: string): string | undefined => {
  // Try process.env first (for EXPO_PUBLIC_ prefixed variables)
  let processEnvValue: string | undefined;
  switch (key) {
    case 'EXPO_PUBLIC_API_URL':
      processEnvValue = process.env.EXPO_PUBLIC_API_URL;
      break;
    case 'EXPO_PUBLIC_TRPC_URL':
      processEnvValue = process.env.EXPO_PUBLIC_TRPC_URL;
      break;
    case 'EXPO_PUBLIC_BASE_URL':
      processEnvValue = process.env.EXPO_PUBLIC_BASE_URL;
      break;
  }
  
  if (processEnvValue && processEnvValue !== 'undefined' && processEnvValue !== 'null') {
    return processEnvValue;
  }

  // Try Constants.expoConfig.extra
  const expoConfigValue = Constants.expoConfig?.extra?.[key];
  if (expoConfigValue && expoConfigValue !== 'undefined' && expoConfigValue !== 'null') {
    return expoConfigValue;
  }

  // Return fallback
  return fallback;
};

/**
 * Get the app configuration with proper fallbacks
 */
export const getAppConfig = (): AppConfig => {
  const isDevelopment = __DEV__;
  const platform = Platform.OS;

  // Production URLs (your deployed Amplify app)
  const prodApiUrl = 'https://zestapp.online/api';
  const prodTrpcUrl = 'https://zestapp.online/api/trpc';
  const prodBaseUrl = 'https://zestapp.online';

  // Development URLs
  const devApiUrl = 'http://localhost:3001/api';
  const devTrpcUrl = 'http://localhost:3001/api/trpc';
  const devBaseUrl = 'http://localhost:3001';

  // Get environment variables with fallbacks
  const apiUrl = getEnvVar('EXPO_PUBLIC_API_URL') || 
                 (isDevelopment && platform !== 'web' ? devApiUrl : prodApiUrl);
  
  const trpcUrl = getEnvVar('EXPO_PUBLIC_TRPC_URL') || 
                  (isDevelopment && platform !== 'web' ? devTrpcUrl : prodTrpcUrl);
  
  const baseUrl = getEnvVar('EXPO_PUBLIC_BASE_URL') || 
                  (isDevelopment && platform !== 'web' ? devBaseUrl : prodBaseUrl);

  const config: AppConfig = {
    apiUrl,
    trpcUrl,
    baseUrl,
    isDevelopment,
    platform,
  };

  // Log configuration for debugging
  console.log('📋 App Configuration:', {
    ...config,
    envVars: {
      'process.env.EXPO_PUBLIC_API_URL': process.env.EXPO_PUBLIC_API_URL,
      'process.env.EXPO_PUBLIC_TRPC_URL': process.env.EXPO_PUBLIC_TRPC_URL,
      'Constants.expoConfig.extra': Constants.expoConfig?.extra,
    }
  });

  return config;
};

/**
 * Debug function to log all environment variable sources
 */
export const debugEnvironment = () => {
  console.log('🔍 Environment Debug Information:');
  console.log('  __DEV__:', __DEV__);
  console.log('  Platform.OS:', Platform.OS);
  console.log('  process.env.NODE_ENV:', process.env.NODE_ENV);
  console.log('  process.env.EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
  console.log('  process.env.EXPO_PUBLIC_TRPC_URL:', process.env.EXPO_PUBLIC_TRPC_URL);
  console.log('  process.env.EXPO_PUBLIC_BASE_URL:', process.env.EXPO_PUBLIC_BASE_URL);
  console.log('  Constants.expoConfig?.extra:', Constants.expoConfig?.extra);
  console.log('  Constants.expoConfig?.name:', Constants.expoConfig?.name);
  console.log('  Constants.expoConfig?.slug:', Constants.expoConfig?.slug);
  
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    console.log('  window.location.origin:', window.location.origin);
    console.log('  window.location.href:', window.location.href);
  }
};

// Export the configuration as default
export default getAppConfig;