import * as Sentry from '@sentry/node';

const SENTRY_DSN = process.env.SENTRY_DSN;
const NODE_ENV = process.env.NODE_ENV || 'development';
const APP_VERSION = process.env.APP_VERSION || '1.0.0';

export interface MonitoringConfig {
  dsn?: string;
  environment: string;
  release: string;
  tracesSampleRate: number;
  profilesSampleRate: number;
  enabled: boolean;
}

export class MonitoringService {
  private static initialized = false;

  static initialize(config?: Partial<MonitoringConfig>): void {
    if (this.initialized) {
      return;
    }

    const finalConfig: MonitoringConfig = {
      dsn: SENTRY_DSN,
      environment: NODE_ENV,
      release: `mycaredaddy@${APP_VERSION}`,
      tracesSampleRate: NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: NODE_ENV === 'production' ? 0.1 : 1.0,
      enabled: !!SENTRY_DSN && NODE_ENV === 'production',
      ...config,
    };

    if (!finalConfig.enabled) {
      console.log('📊 Sentry monitoring disabled (development mode or missing DSN)');
      this.initialized = true;
      return;
    }

    try {
      Sentry.init({
        dsn: finalConfig.dsn,
        environment: finalConfig.environment,
        release: finalConfig.release,
        tracesSampleRate: finalConfig.tracesSampleRate,
        profilesSampleRate: finalConfig.profilesSampleRate,
        
        // Performance monitoring
        integrations: [
          // Basic integrations only
        ],

        // Error filtering
        beforeSend(event, hint) {
          // Filter out common non-critical errors
          const error = hint.originalException;
          
          if (error instanceof Error) {
            // Skip validation errors
            if (error.message.includes('validation') || error.message.includes('required')) {
              return null;
            }
            
            // Skip rate limiting errors
            if (error.message.includes('rate limit') || error.message.includes('too many')) {
              return null;
            }
            
            // Skip authentication errors (these are expected)
            if (error.message.includes('unauthorized') || error.message.includes('invalid token')) {
              return null;
            }
          }
          
          return event;
        },

        // Performance filtering
        tracesSampler(samplingContext) {
          // Don't trace health checks
          if (samplingContext.request?.url?.includes('/health')) {
            return 0;
          }
          
          // Don't trace static assets
          if (samplingContext.request?.url?.includes('/static/')) {
            return 0;
          }
          
          return finalConfig.tracesSampleRate;
        },
      });

      console.log(`📊 Sentry monitoring initialized (${finalConfig.environment})`);
      this.initialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize Sentry:', error);
      this.initialized = true; // Mark as initialized to prevent retries
    }
  }

  static captureException(error: Error, context?: Record<string, any>): string | undefined {
    if (!this.initialized || !SENTRY_DSN) {
      console.error('Unhandled exception:', error);
      return undefined;
    }

    try {
      return Sentry.captureException(error, {
        tags: {
          component: 'backend',
          ...context?.tags,
        },
        extra: {
          timestamp: new Date().toISOString(),
          ...context?.extra,
        },
        user: context?.user,
        level: 'error',
      });
    } catch (sentryError) {
      console.error('Failed to capture exception in Sentry:', sentryError);
      console.error('Original error:', error);
      return undefined;
    }
  }

  static captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>): string | undefined {
    if (!this.initialized || !SENTRY_DSN) {
      console.log(`[${level.toUpperCase()}] ${message}`);
      return undefined;
    }

    try {
      return Sentry.captureMessage(message, {
        level,
        tags: {
          component: 'backend',
          ...context?.tags,
        },
        extra: {
          timestamp: new Date().toISOString(),
          ...context?.extra,
        },
        user: context?.user,
      });
    } catch (error) {
      console.error('Failed to capture message in Sentry:', error);
      console.log(`[${level.toUpperCase()}] ${message}`);
      return undefined;
    }
  }

  static addBreadcrumb(message: string, category: string, data?: Record<string, any>): void {
    if (!this.initialized || !SENTRY_DSN) {
      return;
    }

    try {
      Sentry.addBreadcrumb({
        message,
        category,
        data,
        timestamp: Date.now() / 1000,
        level: 'info',
      });
    } catch (error) {
      console.error('Failed to add breadcrumb:', error);
    }
  }

  static setUser(user: { id: string; email?: string; username?: string }): void {
    if (!this.initialized || !SENTRY_DSN) {
      return;
    }

    try {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.username,
      });
    } catch (error) {
      console.error('Failed to set user context:', error);
    }
  }

  static setTag(key: string, value: string): void {
    if (!this.initialized || !SENTRY_DSN) {
      return;
    }

    try {
      Sentry.setTag(key, value);
    } catch (error) {
      console.error('Failed to set tag:', error);
    }
  }

  static setContext(key: string, context: Record<string, any>): void {
    if (!this.initialized || !SENTRY_DSN) {
      return;
    }

    try {
      Sentry.setContext(key, context);
    } catch (error) {
      console.error('Failed to set context:', error);
    }
  }

  static async flush(timeout = 2000): Promise<boolean> {
    if (!this.initialized || !SENTRY_DSN) {
      return true;
    }

    try {
      return await Sentry.flush(timeout);
    } catch (error) {
      console.error('Failed to flush Sentry:', error);
      return false;
    }
  }

  static startTransaction(name: string, op: string): any {
    if (!this.initialized || !SENTRY_DSN) {
      return null;
    }

    try {
      // Simplified transaction handling
      return { name, op, finish: () => {} };
    } catch (error) {
      console.error('Failed to start transaction:', error);
      return null;
    }
  }

  // Middleware for Express/Hono
  static getRequestHandler() {
    return (req: any, res: any, next: any) => next();
  }

  static getTracingHandler() {
    return (req: any, res: any, next: any) => next();
  }

  static getErrorHandler() {
    return (error: any, req: any, res: any, next: any) => {
      if (error && this.initialized && SENTRY_DSN) {
        this.captureException(error);
      }
      next(error);
    };
  }

  // Business logic monitoring helpers
  static monitorUserAction(userId: string, action: string, metadata?: Record<string, any>): void {
    this.addBreadcrumb(`User action: ${action}`, 'user', {
      userId,
      action,
      ...metadata,
    });

    this.setTag('user_action', action);
    this.setContext('user_action', {
      userId,
      action,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  }

  static monitorCareSignal(signalId: string, userId: string, category: string, urgency: string): void {
    this.addBreadcrumb('Care signal created', 'care_signal', {
      signalId,
      userId,
      category,
      urgency,
    });

    this.setTag('care_signal_category', category);
    this.setTag('care_signal_urgency', urgency);
    
    this.setContext('care_signal', {
      signalId,
      userId,
      category,
      urgency,
      timestamp: new Date().toISOString(),
    });
  }

  static monitorPayment(userId: string, amount: number, currency: string, status: string): void {
    this.addBreadcrumb(`Payment ${status}`, 'payment', {
      userId,
      amount,
      currency,
      status,
    });

    this.setTag('payment_status', status);
    this.setContext('payment', {
      userId,
      amount,
      currency,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  static monitorDatabaseOperation(operation: string, table: string, duration?: number): void {
    this.addBreadcrumb(`Database ${operation}`, 'database', {
      operation,
      table,
      duration,
    });

    if (duration && duration > 1000) {
      this.captureMessage(`Slow database query: ${operation} on ${table} took ${duration}ms`, 'warning', {
        tags: { slow_query: 'true' },
        extra: { operation, table, duration },
      });
    }
  }

  static monitorAPICall(endpoint: string, method: string, statusCode: number, duration: number): void {
    this.addBreadcrumb(`API call: ${method} ${endpoint}`, 'http', {
      endpoint,
      method,
      statusCode,
      duration,
    });

    if (statusCode >= 400) {
      this.setTag('api_error', 'true');
    }

    if (duration > 5000) {
      this.captureMessage(`Slow API call: ${method} ${endpoint} took ${duration}ms`, 'warning', {
        tags: { slow_api: 'true' },
        extra: { endpoint, method, statusCode, duration },
      });
    }
  }
}

// Initialize monitoring on import
MonitoringService.initialize();