'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { siteConfig } from '@/site.config';

function ErrorContent() {
	const searchParams = useSearchParams();
	const error = searchParams.get('error');

	const domainMsg = siteConfig.auth.domain ? ` Only @${siteConfig.auth.domain} accounts are allowed.` : '';
	const errorMessages: Record<string, string> = {
		Configuration: 'There is a problem with the server configuration.',
		AccessDenied: `You do not have permission to sign in.${domainMsg}`,
		Verification: 'The sign in link is no longer valid.',
		Default: 'An unexpected error occurred.',
	};

	const message = errorMessages[error || ''] || errorMessages.Default;

	return (
		<div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
			<div className="max-w-md w-full p-8 text-center">
				<div className="mb-6">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
						className="w-16 h-16 mx-auto text-red-500"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
						/>
					</svg>
				</div>
				<h1 className="text-2xl font-bold mb-2 text-brand-800 dark:text-primary-400">Authentication Error</h1>
				<p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
				<Link
					href="/auth/signin"
					className="inline-flex items-center justify-center px-4 py-2 bg-brand-800 dark:bg-primary-600 text-white rounded-2xl hover:bg-brand-900 dark:hover:bg-primary-700 transition-colors font-medium"
				>
					Try again
				</Link>
			</div>
		</div>
	);
}

export default function ErrorPage() {
	return (
		<Suspense fallback={
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-pulse">Loading...</div>
			</div>
		}>
			<ErrorContent />
		</Suspense>
	);
}
