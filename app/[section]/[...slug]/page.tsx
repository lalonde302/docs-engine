import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDocBySlug, getAllDocSlugs, getDocsSections } from '@/lib/docs';
import { AdrReadingView } from '@/components/AdrReadingView';
import { MarkdownContent } from '@/components/MarkdownContent';
import { MarkdownWithDiagrams } from '@/components/MarkdownWithDiagrams';
import { siteConfig } from '@/site.config';

interface PageProps {
	params: Promise<{
		section: string;
		slug: string[];
	}>;
}

export async function generateStaticParams() {
	const slugs = await getAllDocSlugs();
	return slugs.map(({ section, slug }) => ({
		section,
		slug: slug.split('/'),
	}));
}

export async function generateMetadata({ params }: PageProps) {
	const { section, slug } = await params;
	const slugStr = Array.isArray(slug) ? slug.join('/') : slug;
	const doc = await getDocBySlug(section, slugStr);

	if (!doc) {
		return { title: 'Not Found' };
	}

	return {
		title: `${doc.title} | ${siteConfig.titleSuffix}`,
		description: doc.description,
	};
}

export default async function DocPage({ params }: PageProps) {
	const { section, slug } = await params;
	const slugParts = Array.isArray(slug) ? slug : [slug];
	const slugStr = slugParts.join('/');
	// Require at least one slug segment so we don't match /favicon.ico or bare /archive
	if (!slugStr) {
		notFound();
	}
	const doc = await getDocBySlug(section, slugStr);
	if (!doc) {
		notFound();
	}

	const isArchiveAbout = section === 'archive' && slugStr === 'about-archive';
	const subsections = isArchiveAbout
		? (await getDocsSections()).find((s) => s.slug === 'archive')?.subsections ?? []
		 : [];

	if (isArchiveAbout) {
		return (
			<div className="p-8 max-w-5xl mx-auto">
				<div className="mb-10">
					<span className="inline-block text-xs font-semibold text-brand-700 dark:text-gray-300 uppercase tracking-wide bg-brand-100 dark:bg-[#1a2e25] px-2 py-1 rounded-lg">
						{section}
					</span>
					<h1 className="text-4xl font-bold mt-3 text-brand-800 dark:text-gray-100">{doc.title}</h1>
					{doc.description && (
						<p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
							{doc.description}
						</p>
					)}
				</div>
				{subsections.length > 0 && (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{subsections.map((sub) => {
							const firstDoc = sub.docs[0];
							const href = firstDoc ? `/archive/${firstDoc.slug}` : '#';
							return (
								<Link
									key={sub.slug}
									href={href}
									className="border border-[var(--sidebar-border)] rounded-xl p-5 hover:border-brand-700 dark:hover:border-gray-500 transition-colors bg-white dark:bg-[#1a2420] group"
								>
									<h3 className="font-semibold text-brand-800 dark:text-gray-100 group-hover:underline">
										{sub.title}
									</h3>
									<span className="text-xs text-gray-400 dark:text-gray-500 mt-2 block">
										{sub.docs.length} {sub.docs.length === 1 ? 'doc' : 'docs'}
									</span>
								</Link>
							);
						})}
					</div>
				)}
			</div>
		);
	}

	const hasDiagrams = doc.content.includes('```mermaid');

	if (section === 'adr') {
		return (
			<AdrReadingView
				currentSlug={slugStr}
				title={doc.title}
				description={doc.description}
				content={doc.content}
				hasDiagrams={hasDiagrams}
			/>
		);
	}

	return (
		<div className={`p-8 mx-auto ${hasDiagrams ? 'max-w-6xl' : 'max-w-4xl'}`}>
			<div className="mb-6">
				<span className="inline-block text-xs font-semibold text-brand-700 dark:text-gray-300 uppercase tracking-wide bg-brand-100 dark:bg-[#1a2e25] px-2 py-1 rounded-lg">
					{section}
				</span>
				<h1 className="text-3xl font-bold mt-3 text-brand-800 dark:text-gray-100">{doc.title}</h1>
				{doc.description && (
					<p className="text-gray-600 dark:text-gray-400 mt-2">
						{doc.description}
					</p>
				)}
			</div>
			<div className="border-t border-[var(--sidebar-border)] pt-6">
				{hasDiagrams ? (
					<MarkdownWithDiagrams content={doc.content} />
				) : (
					<MarkdownContent content={doc.content} />
				)}
			</div>
		</div>
	);
}
