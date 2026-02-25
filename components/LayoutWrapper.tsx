'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ChatPanel } from './ChatPanel';
import { siteConfig } from '@/site.config';

interface LayoutWrapperProps {
	children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [chatOpen, setChatOpen] = useState(false);

	return (
		<div className="flex h-screen overflow-hidden">
			{/* Sidebar toggle button (visible when sidebar is hidden) */}
			{!sidebarOpen && (
				<button
					onClick={() => setSidebarOpen(true)}
					className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] hover:bg-[var(--code-bg)] transition-colors"
					aria-label="Open sidebar"
				>
					<svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</button>
			)}

			{/* Sidebar */}
			<Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

			{/* Main content - add top padding when sidebar is closed to avoid hamburger overlap */}
			<main className={`flex-1 overflow-auto ${!sidebarOpen ? 'pt-16' : ''}`}>
				{children}
			</main>

			{/* Chat panel (right column) */}
			{siteConfig.features.chatPanel && (
				<ChatPanel isOpen={chatOpen} onToggle={() => setChatOpen(!chatOpen)} />
			)}
		</div>
	);
}
