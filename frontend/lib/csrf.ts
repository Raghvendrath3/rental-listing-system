// CSRF Protection Utilities
// Implements double-submit cookie pattern for CSRF protection

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';

/**
 * Generate a random CSRF token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Get CSRF token from document or sessionStorage
 */
export function getCSRFToken(): string | null {
  // First, try to get from meta tag
  const meta = document.querySelector('meta[name="csrf-token"]');
  if (meta instanceof HTMLMetaElement) {
    return meta.getAttribute('content');
  }

  // Fall back to sessionStorage
  return sessionStorage.getItem(CSRF_COOKIE_NAME);
}

/**
 * Set CSRF token in sessionStorage and meta tag
 */
export function setCSRFToken(token: string): void {
  sessionStorage.setItem(CSRF_COOKIE_NAME, token);
  
  // Update or create meta tag
  let meta = document.querySelector('meta[name="csrf-token"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'csrf-token');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', token);
}

/**
 * Initialize CSRF token on app load
 */
export function initializeCSRFToken(): void {
  const existingToken = getCSRFToken();
  
  if (!existingToken) {
    const newToken = generateCSRFToken();
    setCSRFToken(newToken);
  }
}

/**
 * Get headers object with CSRF token
 */
export function getCSRFHeaders(): HeadersInit {
  const token = getCSRFToken();
  
  return {
    [CSRF_HEADER_NAME]: token || '',
  };
}

/**
 * Validate CSRF token (server-side would validate, this is client helper)
 */
export function validateCSRFToken(token: string): boolean {
  const storedToken = getCSRFToken();
  return storedToken === token;
}
