export interface SignupPayload {
  email: string;
  password: string;
}

export interface SignupResponseData {
  status: string;
  email: string;
  id: number;
  role: string;
  created_at: string;
}

export interface ApiResponse<T> {
  status: string;
  data?: T;
  message?: string;
}

export interface FieldErrors {
  email?: string;
  password?: string;
}

export interface TouchedFields {
  email: boolean;
  password: boolean;
}

export interface PasswordStrength {
  score: number;       // 0-5
  label: string;
  color: string;
}

export interface LoginResponse {
  status: string;
  token: string;
  user: {
    id: string;
    email: string;
    role: 'user' | 'owner' | 'admin';
  };
}

export interface DecodedToken {
  jwt: string;
  userId: string;
  role: 'user' | 'owner' | 'admin';
  isValid: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    role: 'user' | 'owner' | 'admin';
  } | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
