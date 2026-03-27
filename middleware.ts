import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { authEnabled } from '@/lib/generatedAuthFlags'; 

function shouldSkipAuth() {
	if (!authEnabled) return true;

	const flag = process.env.SKIP_AUTH;
	if (flag === 'true') return true;
	if (flag === 'false') return false;

	return process.env.NODE_ENV === 'development';
}

export default auth((req) => {
	const { pathname } = req.nextUrl;

	if (shouldSkipAuth()) {
		return NextResponse.next();
	}

	if (pathname.startsWith('/auth/') || pathname.startsWith('/api/auth/')) {
		return NextResponse.next();
	}

	if (
		pathname.startsWith('/_next/') ||
		pathname.startsWith('/favicon') ||
		pathname.includes('.')
	) {
		return NextResponse.next();
	}

	if (!req.auth) {
		const signInUrl = new URL('/auth/signin', req.url);
		signInUrl.searchParams.set('callbackUrl', pathname);
		return NextResponse.redirect(signInUrl);
	}

	return NextResponse.next();
});

export const config = {
	matcher: [
		'/((?!_next/static|_next/image|favicon.ico).*)',
	],
};
