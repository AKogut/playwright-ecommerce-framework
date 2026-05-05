export class FrameworkError extends Error {
  readonly code: string;

  constructor(message: string, code = 'FRAMEWORK_ERROR', options?: ErrorOptions) {
    super(message, options);
    this.name = 'FrameworkError';
    this.code = code;
  }
}

export const toError = (value: unknown): Error => {
  if (value instanceof Error) {
    return value;
  }

  return new Error(String(value));
};

export const formatErrorMessage = (value: unknown): string => {
  const error = toError(value);
  return error.message;
};
