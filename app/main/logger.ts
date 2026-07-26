/**
 * Structured logger for main process
 * Wraps electron-log with application-specific formatting
 */

import log from 'electron-log';

export function initializeLogger(): void {
  // Configure file transport
  log.transports.file.level = 'info';
  log.transports.file.maxSize = 5 * 1024 * 1024; // 5 MB
  log.transports.file.format = '{y}-{m}-{d} {h}:{i}:{s}.{ms} [{level}] {text}';

  // Configure console transport
  log.transports.console.level = 'debug';
  log.transports.console.format = '[{level}] {text}';

  log.info('Logger initialized');

  // Catch unhandled exceptions and rejections
  process.on('uncaughtException', (error) => {
    log.error('UNCAUGHT EXCEPTION:', error);
    // Don't exit immediately in production unless necessary, but log it
  });

  process.on('unhandledRejection', (reason) => {
    log.error('UNHANDLED REJECTION:', reason);
  });
}

/**
 * Application logger with namespaced methods
 */
export const logger = {
  info: (message: string, ...args: unknown[]) => log.info(message, ...args),
  warn: (message: string, ...args: unknown[]) => log.warn(message, ...args),
  error: (message: string, ...args: unknown[]) => log.error(message, ...args),
  debug: (message: string, ...args: unknown[]) => log.debug(message, ...args),
  verbose: (message: string, ...args: unknown[]) => log.verbose(message, ...args),

  /** Log with a specific module context */
  module: (moduleName: string) => ({
    info: (msg: string, ...args: unknown[]) => log.info(`[${moduleName}] ${msg}`, ...args),
    warn: (msg: string, ...args: unknown[]) => log.warn(`[${moduleName}] ${msg}`, ...args),
    error: (msg: string, ...args: unknown[]) => log.error(`[${moduleName}] ${msg}`, ...args),
    debug: (msg: string, ...args: unknown[]) => log.debug(`[${moduleName}] ${msg}`, ...args),
  }),
};
