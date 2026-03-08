/**
 * Application Configuration
 * 
 * Centralized configuration for the application.
 * Similar to Spring Boot's application.properties/yaml
 */

export const AppConfig = {
  // Application
  name: 'PlannerOS',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  
  // API
  api: {
    prefix: '/api',
    version: 'v1',
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
  },
  
  // Pagination defaults
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
  
  // Feature flags
  features: {
    enableRealtime: true,
    enableNotifications: true,
    enableFileUploads: true,
  },
} as const;

export type Environment = 'development' | 'production' | 'test';
