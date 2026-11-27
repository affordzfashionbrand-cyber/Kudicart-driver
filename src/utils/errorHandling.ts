export type ErrorCategory =
  | 'INVALID_OTP'
  | 'EXPIRED_OTP'
  | 'USED_OTP'
  | 'NO_ACTIVE_OTP'
  | 'TOO_MANY_ATTEMPTS'
  | 'RESEND_FAILED'
  | 'NETWORK'
  | 'SERVER'
  | 'VALIDATION'
  | 'UNKNOWN';

export interface ParsedAppError {
  category: ErrorCategory;
  message: string;
  isRetryable: boolean;
}

const RAW_TECH_PATTERNS = [
  /failed to fetch/i,
  /network request failed/i,
  /load failed/i,
  /err_connection/i,
  /econnrefused/i,
  /enotfound/i,
  /timeout of \d+/i,
  /unexpected token/i,
  /json parse error/i,
];

function extractRawMessage(err: any): string {
  if (!err) return '';
  if (typeof err === 'string') return err.trim();
  const dataMsg = err?.data?.message;
  if (Array.isArray(dataMsg)) {
    return dataMsg.map((m) => String(m || '').trim()).filter(Boolean).join('. ');
  }
  if (typeof dataMsg === 'string' && dataMsg.trim()) {
    return dataMsg.trim();
  }
  if (typeof err?.message === 'string' && err.message.trim()) {
    return err.message.trim();
  }
  if (typeof err?.data?.error === 'string' && err.data.error.trim()) {
    return err.data.error.trim();
  }
  return '';
}

export function isNetworkFailureError(err: any): boolean {
  if (!err) return false;
  if (err?.isNetworkError) return true;
  const code = String(err?.code || '').toLowerCase();
  if (
    code === 'auth/network-request-failed' ||
    code === 'err_network' ||
    code === 'econnaborted'
  ) {
    return true;
  }
  const raw = extractRawMessage(err);
  return (
    err?.status === 0 ||
    RAW_TECH_PATTERNS.slice(0, 6).some((re) => re.test(raw))
  );
}

export function classifyOtpError(
  err: any,
  context: 'verify' | 'resend' | 'send' = 'verify',
): ParsedAppError {
  const code = String(err?.code || '').toLowerCase();
  const raw = extractRawMessage(err);
  const lower = raw.toLowerCase();
  const status = Number(err?.status || 0);

  if (isNetworkFailureError(err)) {
    return {
      category: 'NETWORK',
      message: 'No internet connection or server unreachable. Please check your network and try again.',
      isRetryable: true,
    };
  }

  if (
    code === 'auth/too-many-requests' ||
    code === 'auth/quota-exceeded' ||
    status === 429 ||
    lower.includes('too many')
  ) {
    return {
      category: 'TOO_MANY_ATTEMPTS',
      message: 'Too many attempts. Please wait a moment or request a new OTP.',
      isRetryable: false,
    };
  }

  if (
    code === 'auth/invalid-verification-code' ||
    code === 'auth/missing-verification-code' ||
    lower.includes('invalid otp') ||
    lower.includes('invalid verification code')
  ) {
    return {
      category: 'INVALID_OTP',
      message: 'Invalid OTP. Please try again.',
      isRetryable: true,
    };
  }

  if (
    lower.includes('already been used') ||
    lower.includes('otp already used')
  ) {
    return {
      category: 'USED_OTP',
      message: 'This OTP has already been used. Please request a new OTP.',
      isRetryable: false,
    };
  }

  if (
    code === 'auth/code-expired' ||
    code === 'auth/session-expired' ||
    lower.includes('expired')
  ) {
    return {
      category: 'EXPIRED_OTP',
      message: 'This OTP has expired. Please request a new OTP.',
      isRetryable: false,
    };
  }

  if (
    lower.includes('no active otp') ||
    lower.includes('request a new otp') ||
    lower.includes('session expired')
  ) {
    return {
      category: 'NO_ACTIVE_OTP',
      message: 'No active OTP request found. Please tap Resend OTP for a new code.',
      isRetryable: false,
    };
  }

  if (status >= 500 || status === 503 || status === 502) {
    return {
      category: 'SERVER',
      message: 'Server is temporarily unavailable. Please try again shortly.',
      isRetryable: true,
    };
  }

  if (context === 'resend') {
    return {
      category: 'RESEND_FAILED',
      message:
        raw && !RAW_TECH_PATTERNS.some((re) => re.test(raw))
          ? raw
          : 'Unable to resend OTP right now. Please try again.',
      isRetryable: true,
    };
  }

  return {
    category: status >= 400 && status < 500 ? 'VALIDATION' : 'UNKNOWN',
    message:
      raw && !RAW_TECH_PATTERNS.some((re) => re.test(raw))
        ? raw
        : 'Unable to complete verification. Please try again.',
    isRetryable: true,
  };
}

export function getFriendlyErrorMessage(
  err: any,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (!err) return fallback;
  if (isNetworkFailureError(err)) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }
  const status = Number(err?.status || 0);
  if (status >= 500) {
    return 'Server is temporarily unavailable. Please try again in a moment.';
  }
  const raw = extractRawMessage(err);
  if (!raw || RAW_TECH_PATTERNS.some((re) => re.test(raw))) {
    return fallback;
  }
  return raw;
}
