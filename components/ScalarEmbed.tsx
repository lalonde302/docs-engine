'use client';

import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import { useTheme } from './ThemeProvider';

interface ScalarEmbedProps {
	specUrl: string;
	title: string;
}

export function ScalarEmbed({ specUrl, title }: ScalarEmbedProps) {
	const { theme } = useTheme();

	// Hide Scalar's sidebar via CSS - scoped to .scalar-app only
	const hideSidebarCss = `
		.scalar-app .sidebar,
		.scalar-app .scalar-sidebar,
		.scalar-app [class*="sidebar"],
		.scalar-app aside,
		.scalar-app nav {
			display: none !important;
		}
		.scalar-app .scalar-api-reference__content {
			max-width: 100% !important;
			margin: 0 !important;
		}
	`;

	const customCss = (theme === 'dark' ? `
		.scalar-app {
			--scalar-font: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
			--scalar-background-1: #111714;
			--scalar-background-2: #151c18;
			--scalar-background-3: #1a2420;
			--scalar-background-accent: #1B4D3E;
			--scalar-color-1: #d4ddd8;
			--scalar-color-2: #9ca3af;
			--scalar-color-3: #6b7280;
			--scalar-color-accent: #7aa88a;
			--scalar-color-green: #5a8a6a;
			--scalar-border-color: #263830;
			--scalar-scrollbar-color: #263830;
			--scalar-scrollbar-color-active: #7aa88a;
			--scalar-lifted-brightness: 1.1;
			--scalar-backdrop-brightness: 0.8;
			--scalar-shadow-1: 0 1px 3px rgba(0,0,0,0.3);
			--scalar-shadow-2: 0 4px 12px rgba(0,0,0,0.4);
			--scalar-button-1: #476f54;
			--scalar-button-1-hover: #3a5a45;
			--scalar-button-1-color: #ffffff;
		}
	` : `
		.scalar-app {
			--scalar-font: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
			--scalar-background-1: #ffffff;
			--scalar-background-2: #f6f9f7;
			--scalar-background-3: #e8f0eb;
			--scalar-background-accent: #d1e1d7;
			--scalar-color-1: #1a1a1a;
			--scalar-color-2: #374151;
			--scalar-color-3: #6b7280;
			--scalar-color-accent: #1B4D3E;
			--scalar-color-green: #3a6850;
			--scalar-border-color: #d1e1d7;
			--scalar-scrollbar-color: #d1e1d7;
			--scalar-scrollbar-color-active: #1B4D3E;
			--scalar-lifted-brightness: 1;
			--scalar-backdrop-brightness: 1;
			--scalar-shadow-1: 0 1px 3px rgba(0,0,0,0.08);
			--scalar-shadow-2: 0 4px 12px rgba(0,0,0,0.1);
			--scalar-button-1: #1B4D3E;
			--scalar-button-1-hover: #14352A;
			--scalar-button-1-color: #ffffff;
		}
	`) + hideSidebarCss;

	return (
		<div className="h-full w-full">
			<div className="sr-only">
				<h1>{title}</h1>
			</div>
			<ApiReferenceReact
				configuration={{
					spec: {
						url: specUrl,
					},
					theme: 'none',
					layout: 'modern',
					darkMode: theme === 'dark',
					hideDarkModeToggle: true,
					showSidebar: false,
					proxyUrl: '/api/scalar-proxy',
					customCss,
				}}
			/>
		</div>
	);
}
