import Link from 'next/link';
import { getDocBySlug } from '@/lib/docs';
import { MarkdownWithDiagrams } from '@/components/MarkdownWithDiagrams';
import { siteConfig } from '@/site.config';

export const metadata = {
	title: `ADR Tracks | ${siteConfig.titleSuffix}`,
	description:
		'Architecture Decision Records organized as thematic tracks. Tree view of how decisions evolved across lesson data, identity, deployment, docs platform, and more.',
};

export default async function AdrHomePage() {
	const doc = await getDocBySlug('reference', 'adr-tracks');
	if (!doc) {
		return (
			<div className="p-8 max-w-4xl mx-auto">
				<p className="text-gray-600 dark:text-gray-400">ADR Tracks content could not be loaded.</p>
			</div>
		);
	}

	const hasDiagrams = doc.content.includes('```mermaid');

	return (
		<div className={`p-8 mx-auto ${hasDiagrams ? 'max-w-6xl' : 'max-w-4xl'}`}>
			<div className="mb-6">
				<span className="inline-block text-xs font-semibold text-brand-700 dark:text-gray-300 uppercase tracking-wide bg-brand-100 dark:bg-[#1a2e25] px-2 py-1 rounded-lg">
					ADR
				</span>
				<h1 className="text-3xl font-bold mt-3 text-brand-800 dark:text-gray-100">{doc.title}</h1>
				{doc.description && (
					<p className="text-gray-600 dark:text-gray-400 mt-2">{doc.description}</p>
				)}
				<p className="text-gray-600 dark:text-gray-400 mt-2">
					Browse by track below, or{' '}
					<Link
						href="/adr/adr-0000-adr-format"
						className="text-brand-600 dark:text-brand-400 hover:underline"
					>
						open individual ADRs
					</Link>{' '}
					from the sidebar.
				</p>
			</div>
			<div className="border-t border-[var(--sidebar-border)] pt-6">
				<MarkdownWithDiagrams content={doc.content} />
			</div>
		</div>
	);
}
