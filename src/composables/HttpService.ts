import { ref } from 'vue';

import useConfig from '@/composables/ConfigService';
import useLoggingService from '@/composables/LoggingService';
import type { ApiResponse } from '@/interfaces';

const { getApiHost } = useConfig();
const log = useLoggingService();

const state = {
  authenticationCallbacks: ref([] as Array<() => Promise<boolean>>),
  host: getApiHost(),
  requestCallbacks: ref([] as Array<(options: RequestInit) => Promise<boolean>>),
};

function getHeaders() {
  const headers: Record<string, string> = {
    ['Content-Type']: 'application/json',
  };

  return headers;
}

function registerAuthenticationCallback(callback: () => Promise<boolean>) {
  state.authenticationCallbacks.value.push(callback);
}

function registerRequestCallback(callback: (options: RequestInit) => Promise<boolean>) {
  state.requestCallbacks.value.push(callback);
}

async function request<T>(url: string, options: RequestInit): Promise<ApiResponse<T>> {
  const apiHost = getApiHost().value;
  const headers = getHeaders();
  options.headers = { ...headers, ...options.headers };

  for (const callback of state.requestCallbacks.value) {
    if (!callback(options)) {
      return {
        success: false,
        timestamp: new Date(),
        errorCode: 'CANCELLED',
        errorMessage: 'Request cancelled by callback',
      };
    }
  }

  const response = await fetch(`${apiHost}${url}`, options);

  if (!response.ok) {
    log.error(`Request to ${apiHost}${url} failed with status ${response.status}`);
    return {
      success: false,
      timestamp: new Date(),
      errorCode: response.status.toString(),
      errorMessage: response.statusText,
    };
  }

  const data: ApiResponse<T> = await response.json();

  return data;
}

// Retry wrapper specifically for auth/network issues
async function withAuthRetry<T>(
  operation: () => Promise<ApiResponse<T>>,
  retries = 3,
  baseDelay = 1000
): Promise<ApiResponse<T>> {
  let attempts = 0;

  while (attempts < retries) {
    try {
      const result = await operation();

      // Success case - return immediately
      if (result.success) {
        return result;
      }

      // Handle auth errors
      if (result.errorCode === '401') {
        log.info('Token invalid, re-authenticating...');
        let authed = false;

        for (const callback of state.authenticationCallbacks.value) {
          if (await callback()) {
            authed = true;
            break;
          }
        }

        if (!authed) {
          return result; // Failed to re-authenticate, return error
        }
        // Successfully re-authenticated, retry on next loop
      }
      // Other errors don't retry
      else if (result.errorCode !== '503' && result.errorCode !== 'NETWORK_ERROR') {
        return result;
      }

      attempts++;
      if (attempts < retries) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, attempts)));
      }
    } catch (error: unknown) {
      // Network errors
      attempts++;
      if (attempts === retries) {
        const message = (error as Error).message ?? error;

        return {
          success: false,
          timestamp: new Date(),
          errorCode: 'NETWORK_ERROR',
          errorMessage: message,
        };
      }
      await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, attempts)));
    }
  }

  log.warn(`Failed after ${retries} attempts`);
  return {
    success: false,
    timestamp: new Date(),
    errorCode: 'RETRY_EXHAUSTED',
    errorMessage: `Failed after ${retries} attempts`,
  };
}

// Update HTTP methods to use new retry wrapper
async function get<T>(url: string): Promise<ApiResponse<T>> {
  return withAuthRetry(() => request<T>(url, { method: 'GET' }));
}

async function post<T>(url: string, data: object): Promise<ApiResponse<T>> {
  return withAuthRetry(() =>
    request<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  );
}

function useHttpService() {
  return {
    get,
    post,
    registerAuthenticationCallback,
    registerRequestCallback,
  };
}

export default useHttpService;
