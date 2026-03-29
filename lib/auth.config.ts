import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

const authEnabled = process.env.DOCS_AUTH_ENABLED === 'true';
const authDomain = process.env.DOCS_AUTH_DOMAIN || undefined;
const hasGoogle = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

const providers: NextAuthConfig['providers'] = [];

if (hasGoogle) {
	providers.push(
		Google({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			authorization: authDomain
				? { params: { hd: authDomain } }
				: undefined,
		}),
	);
}

if (process.env.DOCS_SITE_PASSWORD) {
	providers.push(
		Credentials({
			name: 'Password',
			credentials: {
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (credentials?.password === process.env.DOCS_SITE_PASSWORD) {
					return { id: 'shared-user', name: 'Team Member' };
				}
				return null;
			},
		}),
	);
}

export const authConfig = {
	providers,
	session: { strategy: 'jwt' as const },
	callbacks: {
		async signIn({ account, profile }) {
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
