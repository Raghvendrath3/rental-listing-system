import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper to decode JWT token payload without dependencies
function decodeJwt(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode base64 URL encoded payload
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Layer 1 RBAC: Intercept proxy API routes on the Next.js server
  if (pathname.startsWith('/api/inquiries') || pathname.startsWith('/api/owner/inquiries')) {
    // 1. Extract token from Authorization header or rental_token cookie
    let token = '';
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      const cookie = request.cookies.get('rental_token');
      if (cookie) {
        token = cookie.value;
      }
    }

    if (!token) {
      return new NextResponse(
        JSON.stringify({ status: 'fail', message: 'Unauthorized: No token provided' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Decode and validate the role in the JWT claims
    const decoded = decodeJwt(token);
    if (!decoded || !decoded.role) {
      return new NextResponse(
        JSON.stringify({ status: 'fail', message: 'Unauthorized: Invalid token claims' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Enforce role constraints for specific API groups
    if (pathname.startsWith('/api/owner/inquiries')) {
      if (decoded.role !== 'owner' && decoded.role !== 'admin') {
        return new NextResponse(
          JSON.stringify({ status: 'fail', message: 'Forbidden: Owner or Admin role required' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } else if (pathname.startsWith('/api/inquiries')) {
      // Tenants have the 'user' role
      if (decoded.role !== 'user') {
        return new NextResponse(
          JSON.stringify({ status: 'fail', message: 'Forbidden: Tenant role required' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/inquiries/:path*', '/api/owner/inquiries/:path*'],
};
