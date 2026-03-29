import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

const { auth } = NextAuth(authConfig);

function shouldSkipAuth() {
	if (process.env.DOCS_AUTH_ENABLED !== 'true') return true;

	const flag = process.env.SKIP_AUTH;
	if (flag === 'true') return true;
	if (flag === 'false') return false;

	return process.env.NODE_ENV === 'development';
}

export default auth((req) => {
	if (shouldSkipAuth()) return;

	const { pathname } = req.nextUrl;

	if (pathname.startsWith('/auth/') || pathname.startsWith('/api/auth/')) {
		return;
	}

	if (
		pathname.startsWith('/_next/') ||
		pathname.startsWith('/favicon') ||
		pathname.includes('.')
	) {
		return;
	}

	if (!req.auth) {
		const signInUrl = new URL('/auth/signin', req.url);
		signInUrl.searchParams.set('callbackUrl', pathname);
		return Response.redirect(signInUrl);
	}
});

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
