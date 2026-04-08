import { SignupPayload, SignupResponseData, ApiResponse, LoginResponse } from '@/types/auth.types';
import { apiFetch } from './api';
import { storeToken, clearToken } from './tokenManager';

export async function signupUser(
  payload: SignupPayload
): Promise<ApiResponse<SignupResponseData>> {
  return apiFetch<SignupResponseData>('/users/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, false); // Don't include auth header for signup
}

export async function login(credentials: Record<string, string>): Promise<LoginResponse> {
  const response = await apiFetch<LoginResponse>('/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }, false); // Don't include auth header for login

  // Store the token if login successful
  if (response.token) {
    storeToken(response.token);
  }

  return response;
}

export function logout(): void {
  clearToken();
}
