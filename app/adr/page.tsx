import Link from 'next/link';
import { getDocBySlug, getDocsSections } from '@/lib/docs';
import { MarkdownWithDiagrams } from '@/components/MarkdownWithDiagrams';
import { siteConfig } from '@/site.config';

export const metadata = {
	title: `ADRs | ${siteConfig.titleSuffix}`,
	description:
		'Architecture Decision Records — a durable log of the significant technical decisions behind this project.',
};

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
	proposed: { label: 'Proposed', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
	accepted: { label: 'Accepted', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
	implemented: { label: 'Implemented', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
	deprecated: { label: 'Deprecated', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
	superseded: { label: 'Superseded', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
};

function extractStatus(content: string): string | null {
	const match = content.match(/\*\*Status:\*\*\s*(\w+)/i);
	return match ? match[1].toLowerCase() : null;
}

function extractDate(content: string): string | null {
	const match = content.match(/\*\*Date:\*\*\s*(\d{4}-\d{2}-\d{2})/);
	return match ? match[1] : null;
}

export default async function AdrHomePage() {
	const sections = await getDocsSections();
	const adrSection = sections.find((s) => s.slug === 'adr');
	const allAdrs = [...(adrSection?.docs ?? []), ...(adrSection?.archivedDocs ?? [])];

	const adrsWithMeta = await Promise.all(
		allAdrs.map(async (adr) => {
			const doc = await getDocBySlug('adr', adr.slug);
			return {
				...adr,
				status: doc ? extractStatus(doc.content) : null,
				date: doc ? extractDate(doc.content) : null,
			};
		}),
	);

	adrsWithMeta.sort((a, b) => {
		const numA = parseInt(a.slug.match(/adr-(\d+)/)?.[1] ?? '9999');
		const numB = parseInt(b.slug.match(/adr-(\d+)/)?.[1] ?? '9999');
		return numA - numB;
	});

	const tracksDoc = await getDocBySlug('reference', 'adr-tracks');
	const hasTracksDiagrams = tracksDoc?.content.includes('```mermaid') ?? false;

	return (
		<div className={`p-8 mx-auto ${hasTracksDiagrams ? 'max-w-6xl' : 'max-w-4xl'}`}>
			<div className="mb-8">
				<span className="inline-block text-xs font-semibold text-brand-700 dark:text-gray-300 uppercase tracking-wide bg-brand-100 dark:bg-[#1a2e25] px-2 py-1 rounded-lg">
					ADR
				</span>
				<h1 className="text-3xl font-bold mt-3 text-brand-800 dark:text-gray-100">
					Architecture Decision Records
				</h1>
				<p className="text-gray-600 dark:text-gray-400 mt-3 text-lg leading-relaxed">
					ADRs are the canonical record of significant technical decisions for {siteConfig.name}.
					Each one captures <em>what</em> was decided, <em>why</em>, and the tradeoffs involved —
					so the team never has to relitigate settled ground or wonder why the system is shaped
					the way it is.
				</p>
			</div>

			<div className="grid sm:grid-cols-3 gap-4 mb-10">
				<div className="rounded-2xl border border-[var(--sidebar-border)] p-4">
					<p className="text-sm font-semibold text-brand-700 dark:text-brand-400 mb-1">Format</p>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Context → Decision → Reasoning → Consequences. Every ADR follows the same structure.
					</p>
				</div>
				<div className="rounded-2xl border border-[var(--sidebar-border)] p-4">
					<p className="text-sm font-semibold text-brand-700 dark:text-brand-400 mb-1">Lifecycle</p>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Proposed → Accepted → Implemented. Decisions can later be Deprecated or Superseded.
					</p>
				</div>
				<div className="rounded-2xl border border-[var(--sidebar-border)] p-4">
					<p className="text-sm font-semibold text-brand-700 dark:text-brand-400 mb-1">Authority</p>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Active ADRs are binding. Code that contradicts them is out of compliance until the ADR is amended.
					</p>
				</div>
			</div>

			{adrsWithMeta.length > 0 && (
				<div className="mb-10">
					<h2 className="text-xl font-semibold text-brand-800 dark:text-gray-100 mb-4">
						All decisions
					</h2>
					<div className="border border-[var(--sidebar-border)] rounded-2xl overflow-hidden">
						{adrsWithMeta.map((adr, i) => {
							const badge = adr.status ? STATUS_BADGES[adr.status] : null;
							return (
								<Link
									key={adr.slug}
									href={`/adr/${adr.slug}`}
									className={`flex items-center justify-between px-5 py-3 hover:bg-brand-50 dark:hover:bg-[#1a2e25] transition-colors ${
										i > 0 ? 'border-t border-[var(--sidebar-border)]' : ''
									}`}
								>
									<span className="text-gray-900 dark:text-gray-100 font-medium">
										{adr.title}
									</span>
									<span className="flex items-center gap-3 shrink-0 ml-4">
										{adr.date && (
											<span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
												{adr.date}
											</span>
										)}
										{badge && (
											<span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}>
												{badge.label}
											</span>
										)}
									</span>
								</Link>
							);
						})}
					</div>
				</div>
			)}

			{tracksDoc && (
				<div>
					<h2 className="text-xl font-semibold text-brand-800 dark:text-gray-100 mb-4">
						{tracksDoc.title ?? 'ADR Tracks'}
					</h2>
					{tracksDoc.description && (
						<p className="text-gray-600 dark:text-gray-400 mb-4">{tracksDoc.description}</p>
					)}
					<div className="border-t border-[var(--sidebar-border)] pt-6">
						<MarkdownWithDiagrams content={tracksDoc.content} />
					</div>
				</div>
			)}

			{!tracksDoc && adrsWithMeta.length === 0 && (
				<p className="text-gray-500 dark:text-gray-400">
					No ADRs have been recorded yet. When the team makes its first architectural decision,
					it will appear here.
				</p>
			)}
		</div>
	);
}
