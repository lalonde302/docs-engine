'use client';

import { signOut, useSession } from 'next-auth/react';

export function SignOutButton() {
	const { data: session, status } = useSession();

	if (status === 'loading') {
		return (
			<div className="text-sm text-brand-800/50 dark:text-primary-400/50">Loading...</div>
		);
	}

	if (!session?.user) {
		return null;
	}

	return (
		<div className="flex items-center justify-between gap-2">
			<div className="text-sm truncate flex-1">
				<span className="text-gray-500 dark:text-gray-400">Signed in as</span>
				<br />
				<span className="font-medium text-brand-800 dark:text-primary-300">{session.user.email}</span>
			</div>
			<button
				onClick={() => signOut()}
				className="text-xs font-medium px-2 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
			>
				Sign out
			</button>
		</div>
	);
}
