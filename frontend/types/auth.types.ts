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
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
};