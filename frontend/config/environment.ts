/**
 * Environment Configuration
 * Centralized configuration for different environments (dev, staging, production)
 * Validates that required environment variables are set
 */

type Environment = 'development' | 'staging' | 'production';

interface EnvironmentConfig {
  apiUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
  isStaging: boolean;
  siteUrl: string;
  enforceHttps: boolean;
  sessionTimeout: number;
  loginRateLimit: number;
  apiRateLimit: number;
  debug: boolean;
  sourceMaps: boolean;
  features: {
    adminDashboard: boolean;
    ownerDashboard: boolean;
    userListings: boolean;
  };
  monitoring: {
    gaId?: string;
    sentryDsn?: string;
  };
}

const environment: Environment = (process.env.NODE_ENV as Environment) || 'development';

/**
 * Get environment-specific configuration
 */
function getEnvironmentConfig(): EnvironmentConfig {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
    throw new Error(
      'Missing required environment variable: NEXT_PUBLIC_API_URL. ' +
      'Please copy .env.example to .env.local and configure it.'
    );
  }

  const config: EnvironmentConfig = {
    apiUrl,
    isDevelopment: environment === 'development',
    isProduction: environment === 'production',
    isStaging: environment === 'staging',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    enforceHttps: process.env.NEXT_PUBLIC_ENFORCE_HTTPS === 'true',
    sessionTimeout: parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT || '3600000', 10),
    loginRateLimit: parseInt(process.env.NEXT_PUBLIC_LOGIN_RATE_LIMIT || '5', 10),
    apiRateLimit: parseInt(process.env.NEXT_PUBLIC_API_RATE_LIMIT || '100', 10),
    debug: process.env.NEXT_PUBLIC_DEBUG === 'true',
    sourceMaps: process.env.NEXT_PUBLIC_SOURCE_MAPS === 'true',
    features: {
      adminDashboard: process.env.NEXT_PUBLIC_FEATURE_ADMIN_DASHBOARD !== 'false',
      ownerDashboard: process.env.NEXT_PUBLIC_FEATURE_OWNER_DASHBOARD !== 'false',
      userListings: process.env.NEXT_PUBLIC_FEATURE_USER_LISTINGS !== 'false',
    },
    monitoring: {
      gaId: process.env.NEXT_PUBLIC_GA_ID,
      sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    },
  };

  // Warn if debug mode is enabled in production
  if (config.isProduction && config.debug) {
    console.warn('⚠️  WARNING: Debug mode is enabled in production!');
  }

  // Enforce HTTPS in production
  if (config.isProduction && !config.enforceHttps) {
    console.warn('⚠️  WARNING: HTTPS enforcement is disabled in production!');
  }

  return config;
}

// Export singleton configuration
export const envConfig = getEnvironmentConfig();

/**
 * Log environment configuration (safe values only, no secrets)
 */
export function logEnvironmentConfig(): void {
  if (envConfig.isDevelopment) {
    console.log('🔧 Environment Configuration:', {
      environment,
      isDevelopment: envConfig.isDevelopment,
      isProduction: envConfig.isProduction,
      isStaging: envConfig.isStaging,
      siteUrl: envConfig.siteUrl,
      enforceHttps: envConfig.enforceHttps,
      debug: envConfig.debug,
      features: envConfig.features,
    });
  }
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof EnvironmentConfig['features']): boolean {
  return envConfig.features[feature];
}

/**
 * Get API URL with trailing slash removed
 */
export function getApiUrl(): string {
  return envConfig.apiUrl.replace(/\/$/, '');
}
