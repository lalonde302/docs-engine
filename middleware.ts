import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { siteConfig } from '@/site.config';

function shouldSkipAuth() {
	if (!siteConfig.auth.enabled) return true;

	const flag = process.env.SKIP_AUTH;
	if (flag === 'true') return true;
	if (flag === 'false') return false;

	return process.env.NODE_ENV === 'development';
}

export default auth((req) => {
	const { pathname } = req.nextUrl;

	// Skip auth entirely if configured (for local development)
	if (shouldSkipAuth()) {
		return NextResponse.next();
	}

	// Allow auth-related routes
	if (pathname.startsWith('/auth/') || pathname.startsWith('/api/auth/')) {
		return NextResponse.next();
	}

	// Allow static files and Next.js internals
	if (
		pathname.startsWith('/_next/') ||
		pathname.startsWith('/favicon') ||
		pathname.includes('.')
	) {
		return NextResponse.next();
	}

	// Check if user is authenticated
	if (!req.auth) {
		const signInUrl = new URL('/auth/signin', req.url);
		signInUrl.searchParams.set('callbackUrl', pathname);
		return NextResponse.redirect(signInUrl);
	}

	return NextResponse.next();
});

export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		'/((?!_next/static|_next/image|favicon.ico).*)',
	],
};
