'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MarkdownContent } from '@/components/MarkdownContent';
import { MarkdownWithDiagrams } from '@/components/MarkdownWithDiagrams';

interface AdrReadingViewProps {
	currentSlug: string;
	title: string;
	description?: string;
	content: string;
	hasDiagrams: boolean;
}

type PanelState =
	| { mode: 'closed' }
	| { mode: 'loading'; slug: string; hash?: string }
	| { mode: 'error'; slug: string; hash?: string; message: string }
	| {
			mode: 'ready';
			slug: string;
			hash?: string;
			title: string;
			description?: string | null;
			content: string;
			hasDiagrams: boolean;
	  };

function prefersAdrPanel(): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia('(min-width: 1024px)').matches;
}

async function fetchDocJson(slug: string): Promise<Omit<Extract<PanelState, { mode: 'ready' }>, 'mode' | 'hash'>> {
	const u = new URL('/api/doc', window.location.origin);
	u.searchParams.set('section', 'adr');
	u.searchParams.set('slug', slug);
	const res = await fetch(u.toString());
	if (!res.ok) {
		throw new Error(res.status === 404 ? 'Document not found' : 'Failed to load document');
	}
	const data = (await res.json()) as {
		title: string;
		description?: string | null;
		content: string;
	};
	const hasDiagrams = data.content.includes('```mermaid');
	return {
		slug,
		title: data.title,
		description: data.description,
		content: data.content,
		hasDiagrams,
	};
}

function scrollPanelToHash(container: HTMLElement | null, hash: string | undefined) {
	if (!container || !hash) return;
	requestAnimationFrame(() => {
		const el = container.querySelector(`#${CSS.escape(hash)}`);
		el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	});
}

export function AdrReadingView({
	currentSlug,
	title,
	description,
	content,
	hasDiagrams,
}: AdrReadingViewProps) {
	const router = useRouter();
	const [panel, setPanel] = useState<PanelState>({ mode: 'closed' });
	const panelBodyRef = useRef<HTMLDivElement>(null);

	const openRelatedAdr = useCallback(
		async (slug: string, hash?: string) => {
			if (slug === currentSlug) {
				if (hash && typeof document !== 'undefined') {
					const el = document.getElementById(hash);
					el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}
				return;
			}

			const href = `/adr/${slug}${hash ? `#${hash}` : ''}`;
			if (!prefersAdrPanel()) {
				router.push(href);
				return;
			}

			setPanel({ mode: 'loading', slug, hash });
			try {
				const data = await fetchDocJson(slug);
				setPanel({ mode: 'ready', ...data, hash });
			} catch (e) {
				setPanel({
					mode: 'error',
					slug,
					hash,
					message: e instanceof Error ? e.message : 'Failed to load',
				});
			}
		},
		[currentSlug, router]
	);

	useEffect(() => {
		if (panel.mode === 'ready') {
			scrollPanelToHash(panelBodyRef.current, panel.hash);
		}
	}, [panel]);

	useEffect(() => {
		if (panel.mode === 'closed') return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setPanel({ mode: 'closed' });
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [panel.mode]);

	const panelOpen = panel.mode !== 'closed';

	const fullPageHref =
		panel.mode === 'ready' || panel.mode === 'loading' || panel.mode === 'error'
			? `/adr/${panel.slug}${panel.hash ? `#${panel.hash}` : ''}`
			: '#';

	const readerPath = `/adr/${currentSlug}`;

	return (
		<div className="relative flex w-full min-h-full">
			<div
				className={`min-w-0 flex-1 overflow-y-auto p-8 mx-auto transition-[padding] ${
					hasDiagrams ? 'max-w-6xl' : 'max-w-4xl'
				} ${panelOpen ? 'lg:pr-[min(42vw,32rem)]' : ''}`}
			>
				<div className="mb-6">
					<span className="inline-block text-xs font-semibold text-brand-700 dark:text-gray-300 uppercase tracking-wide bg-brand-100 dark:bg-[#1a2e25] px-2 py-1 rounded-lg">
						adr
					</span>
					<h1 className="text-3xl font-bold mt-3 text-brand-800 dark:text-gray-100">{title}</h1>
					{description && (
						<p className="text-gray-600 dark:text-gray-400 mt-2">{description}</p>
					)}
				</div>
				<div className="border-t border-[var(--sidebar-border)] pt-6">
					{hasDiagrams ? (
						<MarkdownWithDiagrams
							content={content}
							adrReaderPathname={readerPath}
							adrReaderSlug={currentSlug}
							onAdrRelatedNav={openRelatedAdr}
						/>
					) : (
						<MarkdownContent
							content={content}
							adrReaderPathname={readerPath}
							adrReaderSlug={currentSlug}
							onAdrRelatedNav={openRelatedAdr}
						/>
					)}
				</div>
			</div>

			{panelOpen && (
				<aside
					className="fixed inset-y-0 right-0 z-30 hidden w-[min(42vw,32rem)] lg:flex lg:flex-col border-l border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] dark:bg-[#151c18] shadow-lg"
					aria-label="Related ADR preview"
				>
					<div className="flex items-start justify-between gap-2 px-4 py-3 border-b border-[var(--sidebar-border)]">
						<div className="min-w-0">
							<p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
								Related ADR
							</p>
							<h2 className="text-lg font-semibold text-brand-800 dark:text-gray-100 leading-snug truncate">
								{panel.mode === 'loading' && 'Loading…'}
								{panel.mode === 'ready' && panel.title}
								{panel.mode === 'error' && 'Could not load'}
							</h2>
						</div>
						<button
							type="button"
							onClick={() => setPanel({ mode: 'closed' })}
							className="shrink-0 rounded-lg p-1.5 text-gray-500 hover:bg-[var(--code-bg)] hover:text-gray-800 dark:hover:text-gray-200"
							aria-label="Close preview panel"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
					<div className="px-4 py-2 border-b border-[var(--sidebar-border)] text-sm">
						<Link
							href={fullPageHref}
							className="text-brand-700 dark:text-brand-300 hover:underline font-medium"
						>
							Open full page
						</Link>
						{(panel.mode === 'ready' || panel.mode === 'loading' || panel.mode === 'error') &&
							panel.hash && (
								<span className="text-gray-500 dark:text-gray-400 ml-2">· #{panel.hash}</span>
							)}
					</div>
					<div ref={panelBodyRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
						{panel.mode === 'error' && (
							<p className="text-sm text-red-600 dark:text-red-400">{panel.message}</p>
						)}
						{panel.mode === 'loading' && (
							<p className="text-sm text-gray-500 dark:text-gray-400">Fetching {panel.slug}…</p>
						)}
						{panel.mode === 'ready' && panel.hasDiagrams && (
							<MarkdownWithDiagrams
								content={panel.content}
								adrReaderPathname={`/adr/${panel.slug}`}
								adrReaderSlug={panel.slug}
								onAdrRelatedNav={openRelatedAdr}
							/>
						)}
						{panel.mode === 'ready' && !panel.hasDiagrams && (
							<MarkdownContent
								content={panel.content}
								adrReaderPathname={`/adr/${panel.slug}`}
								adrReaderSlug={panel.slug}
								onAdrRelatedNav={openRelatedAdr}
							/>
						)}
					</div>
				</aside>
			)}
		</div>
	);
}
