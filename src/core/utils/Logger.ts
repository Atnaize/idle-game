/**
 * Logger utility for centralized logging with environment-aware levels
 *
 * Provides structured logging with different severity levels.
 * Development logs (debug) are only shown in development mode.
 */
export class Logger {
  private static isDevelopment = import.meta.env.DEV;

  /**
   * Debug logging - only shown in development mode
   * Use for detailed information useful during development
   */
  static debug(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.log(`[DEBUG] ${message}`, data ?? '');
    }
  }

  /**
   * Info logging - shown in all environments
   * Use for important events and state changes
   */
  static info(message: string, data?: unknown): void {
    // eslint-disable-next-line no-console
    console.log(`[INFO] ${message}`, data ?? '');
  }

  /**
   * Warning logging - shown in all environments
   * Use for recoverable errors or unexpected states
   */
  static warn(message: string, data?: unknown): void {
    console.warn(`[WARN] ${message}`, data ?? '');
  }

  /**
   * Error logging - shown in all environments
   * Use for errors and exceptions
   */
  static error(message: string, error?: unknown): void {
    console.error(`[ERROR] ${message}`, error ?? '');
  }
}
