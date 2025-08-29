// HARD-CODE OVERRIDES (fill these to bypass env vars quickly)
// Paste your actual values below. Leave as empty strings to fall back to env vars.
const HARDCODED = {
  apiBaseUrl: "https://pb325xwwp9.execute-api.us-east-1.amazonaws.com/prod/",
  cognitoUserPoolId: "us-east-1_w6nHJlnzQ",
  cognitoUserPoolClientId: "76jti2k5n99ntja5imfea26466",
};

export const environment = {
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // API Configuration
  apiBaseUrl: HARDCODED.apiBaseUrl || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
  
  // Cognito Configuration
  cognito: {
    userPoolId: HARDCODED.cognitoUserPoolId || process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
    userPoolClientId: HARDCODED.cognitoUserPoolClientId || process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID || '',
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