import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/lib/auth';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LayoutWrapper } from '@/components/LayoutWrapper';
import { siteConfig } from '@/site.config';
import { getThemeCss } from '@/lib/themeVars';
import './globals.css';

export const metadata: Metadata = {
	title: siteConfig.name,
	description: siteConfig.description,
	icons: {
		icon: '/favicon.png',
	},
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<style dangerouslySetInnerHTML={{ __html: getThemeCss() }} />
			</head>
			<body className="min-h-screen">
				<SessionProvider session={session}>
					<ThemeProvider>
						<LayoutWrapper>
							{children}
						</LayoutWrapper>
					</ThemeProvider>
				</SessionProvider>
			</body>
		</html>
	);
}
