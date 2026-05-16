import { getBusinessCodeMessage } from './businessCodes';

export type ApiFieldErrors = Record<string, string>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toFieldErrors(value: unknown): ApiFieldErrors {
  if (!isPlainObject(value)) {
    return {};
  }

  return Object.entries(value).reduce<ApiFieldErrors>((errors, [field, message]) => {
    if (typeof message === 'string' && message.trim()) {
      errors[field] = message;
    }
    return errors;
  }, {});
}

export function getApiFieldErrors(error: unknown): ApiFieldErrors {
  if (!isPlainObject(error)) {
    return {};
  }

  const data = error.data;
  const directFieldErrors = toFieldErrors(data);
  if (Object.keys(directFieldErrors).length > 0) {
    return directFieldErrors;
  }

  if (isPlainObject(data) && 'fieldErrors' in data) {
    return toFieldErrors(data.fieldErrors);
  }

  return {};
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isPlainObject(error) && typeof error.msg === 'string' && error.msg.trim()) {
    return error.msg;
  }

  if (isPlainObject(error)) {
    const codeMessage = getBusinessCodeMessage(error.code);
    if (codeMessage) {
      return codeMessage;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
