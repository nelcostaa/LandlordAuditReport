/**
 * Structured Logger
 * 
 * Provides consistent, production-safe logging across the application.
 * - In development: Full error details with stack traces
 * - In production: Sanitized errors without stack traces
 */

const isProduction = process.env.NODE_ENV === 'production';

export interface LogContext {
  [key: string]: unknown;
}

/**
 * Log an informational message
 */
export function logInfo(message: string, context?: LogContext): void {
  console.log(JSON.stringify({
    level: 'info',
    message,
    timestamp: new Date().toISOString(),
    ...context,
  }));
}

/**
 * Log a warning message
 */
export function logWarn(message: string, context?: LogContext): void {
  console.warn(JSON.stringify({
    level: 'warn',
    message,
    timestamp: new Date().toISOString(),
    ...context,
  }));
}

/**
 * Log an error - sanitizes stack traces in production
 */
export function logError(message: string, error?: unknown, context?: LogContext): void {
  const errorInfo: LogContext = {};
  
  if (error instanceof Error) {
    errorInfo.errorName = error.name;
    errorInfo.errorMessage = error.message;
    // Only include stack trace in development
    if (!isProduction) {
      errorInfo.stack = error.stack;
    }
  } else if (error) {
    errorInfo.errorValue = isProduction ? '[redacted]' : String(error);
  }

  console.error(JSON.stringify({
    level: 'error',
    message,
    timestamp: new Date().toISOString(),
    ...errorInfo,
    ...context,
  }));
}

/**
 * Create a scoped logger for a specific module/route
 */
export function createLogger(module: string) {
  return {
    info: (message: string, context?: LogContext) => 
      logInfo(`[${module}] ${message}`, context),
    warn: (message: string, context?: LogContext) => 
      logWarn(`[${module}] ${message}`, context),
    error: (message: string, error?: unknown, context?: LogContext) => 
      logError(`[${module}] ${message}`, error, context),
  };
}
