import { DecodedToken } from '@/types/auth.types';

const TOKEN_KEY = 'auth_token';

/**
 * Parse the non-standard token format from the backend
 * Format: "JWT|userId|role"
 */
export function parseToken(token: string): DecodedToken {
  try {
    const parts = token.split('|');
    
    if (parts.length !== 3) {
      return {
        jwt: '',
        userId: '',
        role: 'user',
        isValid: false,
      };
    }

    const [jwt, userId, role] = parts;

    // Validate role
    if (!['user', 'owner', 'admin'].includes(role)) {
      return {
        jwt: '',
        userId: '',
        role: 'user',
        isValid: false,
      };
    }

    return {
      jwt,
      userId,
      role: role as 'user' | 'owner' | 'admin',
      isValid: true,
    };
  } catch (error) {
    console.error('[v0] Token parsing failed:', error);
    return {
      jwt: '',
      userId: '',
      role: 'user',
      isValid: false,
    };
  }
}

/**
 * Store token in localStorage
 */
export function storeToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('[v0] Failed to store token:', error);
  }
}

/**
 * Retrieve token from localStorage
 */
export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('[v0] Failed to retrieve token:', error);
    return null;
  }
}

/**
 * Clear token from localStorage
 */
export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('[v0] Failed to clear token:', error);
  }
}

/**
 * Get the JWT part of the token (for Bearer header)
 */
export function getJWT(): string | null {
  const token = getToken();
  if (!token) return null;
  
  const decoded = parseToken(token);
  return decoded.isValid ? decoded.jwt : null;
}

/**
 * Validate that a token exists and is properly formatted
 */
export function isTokenValid(): boolean {
  const token = getToken();
  if (!token) return false;
  
  const decoded = parseToken(token);
  return decoded.isValid;
}

/**
 * Get stored user info from token
 */
export function getStoredUser() {
  const token = getToken();
  if (!token) return null;
  
  const decoded = parseToken(token);
  if (!decoded.isValid) return null;
  
  return {
    id: decoded.userId,
    role: decoded.role,
  };
}
