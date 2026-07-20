import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwt(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(payload);
    const parsed = JSON.parse(decoded);
    
    // Check if token is expired
    if (parsed.exp && parsed.exp * 1000 < Date.now()) {
      return null; // Token expired
    }
    
    return parsed;
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get tokens from cookies
  const accessToken = request.cookies.get('accessToken')?.value;

  // Decode access token payload
  const user = accessToken ? decodeJwt(accessToken) : null;

  // Admin routes protection
  if (pathname.startsWith('/admin')) {
    // Exclude admin login
    if (pathname === '/admin/login') {
      if (user && user.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next();
    }

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Doctor routes protection
  if (pathname.startsWith('/doctor')) {
    // Exclude public/auth doctor routes
    const isDoctorAuth =
      pathname === '/doctor/login' ||
      pathname === '/doctor/signup' ||
      pathname === '/doctor/pending' ||
      pathname === '/doctor/verify-otp' ||
      pathname === '/doctor/forgot-password' ||
      pathname === '/doctor/reset-password';

    if (isDoctorAuth) {
      if (user && user.role === 'DOCTOR') {
        if (user.status === 'PENDING') {
          if (pathname === '/doctor/pending') return NextResponse.next();
          return NextResponse.redirect(new URL('/doctor/pending', request.url));
        }
        if (user.status === 'ACTIVE') {
          return NextResponse.redirect(new URL('/doctor/dashboard', request.url));
        }
      }
      return NextResponse.next();
    }

    if (!user || user.role !== 'DOCTOR') {
      return NextResponse.redirect(new URL('/doctor/login', request.url));
    }

    // Handle doctor suspension/pending status
    if (user.status === 'PENDING') {
      return NextResponse.redirect(new URL('/doctor/pending', request.url));
    }

    if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
      const response = NextResponse.redirect(new URL('/doctor/login?error=suspended', request.url));
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
      return response;
    }
  }

  // Patient routes protection
  if (pathname.startsWith('/patient')) {
    // Exclude patient auth routes
    const isPatientAuth =
      pathname === '/patient/login' ||
      pathname === '/patient/signup' ||
      pathname === '/patient/verify-otp' ||
      pathname === '/patient/forgot-password' ||
      pathname === '/patient/reset-password';

    if (isPatientAuth) {
      if (user && user.role === 'PATIENT') {
        return NextResponse.redirect(new URL('/patient/dashboard', request.url));
      }
      return NextResponse.next();
    }

    if (!user || user.role !== 'PATIENT') {
      const response = NextResponse.redirect(new URL('/patient/login', request.url));
      // Clear any stale/expired cookies
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
      return response;
    }

    if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
      const response = NextResponse.redirect(new URL('/patient/login?error=suspended', request.url));
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/doctor/:path*', '/patient/:path*'],
};
