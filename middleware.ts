import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function shouldSkipAuth() {
	if (process.env.DOCS_AUTH_ENABLED !== 'true') return true;

	const flag = process.env.SKIP_AUTH;
	if (flag === 'true') return true;
	if (flag === 'false') return false;

	return process.env.NODE_ENV === 'development';
}

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

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

	const secret = process.env.AUTH_SECRET;
	if (!secret) {
		console.error('[middleware] AUTH_SECRET is missing; cannot validate session');
		return NextResponse.next();
	}

	const token = await getToken({ req: request, secret });

	if (!token) {
		const signInUrl = new URL('/auth/signin', request.url);
		signInUrl.searchParams.set('callbackUrl', pathname);
		return NextResponse.redirect(signInUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
