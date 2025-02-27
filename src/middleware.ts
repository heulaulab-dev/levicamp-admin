import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
	const token = request.cookies.get('token')?.value;
	const isLoginPage = request.nextUrl.pathname === '/login';

	// Kalau user sudah login dan akses login page, redirect ke dashboard
	if (token && isLoginPage) {
		return NextResponse.redirect(new URL('/overview', request.url));
	}

	// Kalau user belum login dan akses halaman selain login, redirect ke login page
	if (!token && !isLoginPage) {
		return NextResponse.redirect(new URL('/login', request.url));
	}

	// Lanjutkan request
	return NextResponse.next();
}

// Middleware berlaku untuk semua halaman kecuali static files & API routes
export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
