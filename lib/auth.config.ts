import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import { authDomain, authEnabled } from '@/lib/generatedAuthFlags';

export const authConfig = {
	providers: [
		Google({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			authorization: authDomain
				? { params: { hd: authDomain } }
				: undefined,
		}),
	],
	callbacks: {
		async signIn({ account, profile }) {
			if (!authEnabled) return true;
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
