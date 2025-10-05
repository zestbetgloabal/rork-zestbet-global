import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { loadEnvironmentVariables } from './env-loader';

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
  
  console.log(`🔍 Environment variable ${key}:`, {
    processEnv: processEnvValue,
    isValid: processEnvValue && processEnvValue !== 'undefined' && processEnvValue !== 'null'
  });
  
  if (processEnvValue && processEnvValue !== 'undefined' && processEnvValue !== 'null') {
    return processEnvValue;
  }

  // Try Constants.expoConfig.extra
  const expoConfigValue = Constants.expoConfig?.extra?.[key];
  console.log(`🔍 Expo config ${key}:`, {
    expoConfig: expoConfigValue,
    isValid: expoConfigValue && expoConfigValue !== 'undefined' && expoConfigValue !== 'null'
  });
  
  if (expoConfigValue && expoConfigValue !== 'undefined' && expoConfigValue !== 'null') {
    return expoConfigValue;
  }

  // Return fallback
  console.log(`🔍 Using fallback for ${key}:`, fallback);
  return fallback;
};

/**
 * Get the app configuration with proper fallbacks
 */
export const getAppConfig = (): AppConfig => {
  // Ensure environment variables are loaded
  const envVars = loadEnvironmentVariables();
  
  const isDevelopment = __DEV__;
  const platform = Platform.OS;

  // Production URLs (Vercel deployment)
  const prodApiUrl = 'https://zestapp.vercel.app/api';
  const prodTrpcUrl = 'https://zestapp.vercel.app/api/trpc';
  const prodBaseUrl = 'https://zestapp.vercel.app';

  // Development URLs
  const devApiUrl = 'http://localhost:3001/api';
  const devTrpcUrl = 'http://localhost:3001/api/trpc';
  const devBaseUrl = 'http://localhost:3001';
  
  // For now, always use Railway since local backend isn't running
  // if (platform === 'web' && isDevelopment) {
  //   return {
  //     apiUrl: devApiUrl,
  //     trpcUrl: devTrpcUrl,
  //     baseUrl: devBaseUrl,
  //     isDevelopment,
  //     platform,
  //   };
  // }

  // Get environment variables with fallbacks
  // Always use production URLs for now since environment variables are not loading
  const apiUrl = getEnvVar('EXPO_PUBLIC_API_URL') || prodApiUrl;
  const trpcUrl = getEnvVar('EXPO_PUBLIC_TRPC_URL') || prodTrpcUrl;
  const baseUrl = getEnvVar('EXPO_PUBLIC_BASE_URL') || prodBaseUrl;
  
  console.log('🔧 Config resolution:', {
    isDevelopment,
    platform,
    envApiUrl: getEnvVar('EXPO_PUBLIC_API_URL'),
    envTrpcUrl: getEnvVar('EXPO_PUBLIC_TRPC_URL'),
    envBaseUrl: getEnvVar('EXPO_PUBLIC_BASE_URL'),
    finalApiUrl: apiUrl,
    finalTrpcUrl: trpcUrl,
    finalBaseUrl: baseUrl
  });

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