type LogContext = Record<string, unknown>;

const LOG_SCOPE = 'framework';

const nowIso = (): string => new Date().toISOString();

const formatContext = (context?: LogContext): string => {
  if (!context || Object.keys(context).length === 0) {
    return '';
  }

  return ` ${JSON.stringify(context)}`;
};

const formatMessage = (
  level: 'INFO' | 'WARN' | 'ERROR',
  message: string,
  context?: LogContext,
): string => {
  const contextPart = formatContext(context);
  return `[${nowIso()}] [${LOG_SCOPE}] [${level}] ${message}${contextPart}`;
};

export const logger = {
  info(message: string, context?: LogContext): void {
    console.log(formatMessage('INFO', message, context));
  },
  warn(message: string, context?: LogContext): void {
    console.warn(formatMessage('WARN', message, context));
  },
  error(message: string, context?: LogContext): void {
    console.error(formatMessage('ERROR', message, context));
  },
};
