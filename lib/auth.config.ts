import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

const authDomain = process.env['DOCS_AUTH_DOMAIN'] || undefined;
const hasGoogle = !!(
	process.env['GOOGLE_CLIENT_ID'] && process.env['GOOGLE_CLIENT_SECRET']
);

const providers: NextAuthConfig['providers'] = [];

if (hasGoogle) {
	providers.push(
		Google({
			clientId: process.env['GOOGLE_CLIENT_ID'],
			clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
			authorization: authDomain
				? { params: { hd: authDomain } }
				: undefined,
		}),
	);
}

// Always register Credentials so the route exists; password is checked at request time.
// (If we only registered when DOCS_SITE_PASSWORD was set at *build* time, CI could omit it.)
providers.push(
	Credentials({
		name: 'Password',
		credentials: {
			password: { label: 'Password', type: 'password' },
		},
		async authorize(credentials) {
			const expected = process.env['DOCS_SITE_PASSWORD'];
			if (!expected || credentials?.password !== expected) return null;
			return { id: 'shared-user', name: 'Team Member' };
		},
	}),
);

export const authConfig = {
	providers,
	session: { strategy: 'jwt' as const },
	callbacks: {
		async signIn({ account, profile }) {
			const authEnabled =
				process.env['DOCS_AUTH_ENABLED']?.toLowerCase() === 'true';
			if (!authEnabled) return true;
			if (account?.provider === 'credentials') return true;
			if (account?.provider === 'google') {
				if (!authDomain) return true;
				return profile?.email?.endsWith(`@${authDomain}`) ?? false;
			}
			return false;
		},
		async session({ session, token }) {
			if (session.user && token.sub) {
				session.user.id = token.sub;
			}
			return session;
		},
	},
	pages: {
		signIn: '/auth/signin',
		error: '/auth/error',
	},
} satisfies NextAuthConfig;
