import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

const { auth } = NextAuth(authConfig);

function envFlagTrue(key: string): boolean {
	const v = process.env[key];
	return v !== undefined && v.toLowerCase() === 'true';
}

function shouldSkipAuth() {
	// Bracket keys avoid static env replacement; values must exist at build time on CI
	// (see tradeyard-docs vercel-deploy.yml: copy .vercel/.env → .env.production.local).
	if (!envFlagTrue('DOCS_AUTH_ENABLED')) return true;

	const flag = process.env['SKIP_AUTH'];
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
