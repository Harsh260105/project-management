export const environment = {
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // API Configuration
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
  
  // Cognito Configuration
  cognito: {
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
    userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID || '',
  },
  
  // Feature Flags
  features: {
    enableDebugLogging: process.env.NODE_ENV === 'development',
    enableErrorReporting: process.env.NODE_ENV === 'production',
    enablePerformanceMonitoring: process.env.NODE_ENV === 'production',
  },
  
  // Error Reporting
  errorReporting: {
    enabled: process.env.NODE_ENV === 'production',
    // Add your error reporting service configuration here
    // sentry: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },
  
  // Performance Monitoring
  performance: {
    enabled: process.env.NODE_ENV === 'production',
    // Add your performance monitoring configuration here
  },
};

// Validation function to ensure required environment variables are set
export const validateEnvironment = (): void => {
  const missingKeys: string[] = [];
  if (!environment.cognito.userPoolId) {
    missingKeys.push('NEXT_PUBLIC_COGNITO_USER_POOL_ID');
  }
  if (!environment.cognito.userPoolClientId) {
    missingKeys.push('NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID');
  }
  if (!environment.apiBaseUrl) {
    missingKeys.push('NEXT_PUBLIC_API_BASE_URL');
  }

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingKeys.join(', ')}`
    );
  }
};

// Safe console logging that respects environment
export const safeLog = {
  log: (...args: any[]) => {
    if (!environment.isProduction) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error(...args);
  },
  warn: (...args: any[]) => {
    if (!environment.isProduction) {
      console.warn(...args);
    }
  },
  debug: (...args: any[]) => {
    if (environment.features.enableDebugLogging) {
      console.log('[DEBUG]', ...args);
    }
  },
}; 