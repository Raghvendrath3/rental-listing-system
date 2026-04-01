import { SignupPayload, SignupResponseData, ApiResponse, LoginResponse } from '@/types/auth.types';

import {apiFetch} from './api';
// import { headers } from 'next/dist/server/request/headers';

export async function signupUser(
  payload: SignupPayload
): Promise<ApiResponse<SignupResponseData>> {
  return apiFetch<SignupResponseData>('/users/', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function login(credentials: Record<string, string>): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
}