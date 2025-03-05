import { ref } from 'vue';

import useHttp from '@/composables/HttpService';
import useLogging from '@/composables/LoggingService';
import useValidation from '@/composables/ValidationService';

const http = useHttp();
const log = useLogging();
const { isNullOrWhitespace } = useValidation();

import type { ApiResponse } from '@/interfaces';

const state = {
  token: ref(null as string | null),
};

// Authentication callback for HTTP service
async function authenticationCallback() {
  return await provisionToken();
}

// Get the current token
function getToken() {
  return state.token.value;
}

// Get the Twitch login URL
async function getTwitchLoginUrl() {
  const loginUrlResult = await http.get<string>(`/auth/twitch`);
  if (!loginUrlResult.success) {
    throw new Error('Unable to get state string from server');
  }
  return loginUrlResult.data;
}

// Check if the user is authenticated
function isAuthenticated() {
  return !!state.token.value;
}

// Provision a new token
async function provisionToken(): Promise<boolean> {
  if (await validateToken(state.token.value)) {
    return true;
  }

  const tokenStr = localStorage.getItem('token');
  if (await validateToken(tokenStr)) {
    setToken(tokenStr!);
    return true;
  }

  return await refreshToken();
}

// Validate the token
async function validateToken(token: string | null): Promise<boolean> {
  if (!isNullOrWhitespace(token)) {
    log.info('Validating token...');
    const isValid = await http.get<boolean>(`/auth/verify?t=${token}`);
    if (isValid.success) {
      log.info('Token valid');
      return true;
    }
    log.info('Token invalid');
  }
  return false;
}

// Refresh the token
async function refreshToken(): Promise<boolean> {
  try {
    log.info('Refreshing token...');
    const newToken = await http.get<string>('/auth/refresh');
    if (newToken.success) {
      log.info('Token refreshed');
      setToken(newToken.data!);
      return true;
    }
    log.info('Failed to refresh token');
  } catch (e) {
    log.error('Error when trying to refresh token', e);
  }
  return false;
}

// Request callback to add authorization header
function requestCallback(options: RequestInit) {
  if (state.token.value) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${state.token.value}`,
    };
  }
  return Promise.resolve(true);
}

// Set the token in state and local storage
function setToken(token: string) {
  state.token.value = token;
  localStorage.setItem('token', token);
}

// Use Twitch OAuth to get a token
async function useTwitchOauth(code: string, state: string): Promise<ApiResponse<string | null>> {
  return await http.post<string>(`/auth/twitch`, { code, state });
}

// Register callbacks with HTTP service
http.registerAuthenticationCallback(authenticationCallback);
http.registerRequestCallback(requestCallback);

// Export the useAuth composable
function useAuth() {
  return {
    getToken,
    getTwitchLoginUrl,
    isAuthenticated,
    provisionToken,
    setToken,
    useTwitchOauth,
  };
}

export default useAuth;
