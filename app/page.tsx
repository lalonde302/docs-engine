import Link from 'next/link';
import { getDocsSections, getApiSpecs } from '@/lib/docs';
import { siteConfig } from '@/site.config';

const LEARN_SECTIONS = siteConfig.tabs.learn.sections;
const DOCS_SECTIONS = siteConfig.tabs.docs.sections;

export default async function HomePage() {
	const sections = await getDocsSections();
	const apiSpecs = siteConfig.features.apiReference ? await getApiSpecs() : [];

	const learnSections = sections.filter((s) => LEARN_SECTIONS.includes(s.slug));
	const docsSections = sections.filter((s) => DOCS_SECTIONS.includes(s.slug));

	return (
		<div className="p-8 max-w-5xl mx-auto">
			<h1 className="text-4xl font-bold mb-2 text-brand-800 dark:text-gray-100">{siteConfig.name}</h1>
			<p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
				{siteConfig.description}
			</p>

			{/* Docs Section */}
			<section className="mb-12">
				<h2 className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-4">
					{siteConfig.tabs.docs.label}
				</h2>
				<div className="grid gap-4 md:grid-cols-3">
					{docsSections.map((section) => {
						const href =
							siteConfig.features.adrTracks && section.slug === 'adr'
								? '/adr'
								: section.docs[0]
									? `/${section.slug}/${section.docs[0].slug}`
									: '#';
						return (
						<Link
							key={section.slug}
							href={href}
							className="border border-[var(--sidebar-border)] rounded-xl p-5 hover:border-brand-700 dark:hover:border-gray-500 transition-colors bg-white dark:bg-[#1a2420] group"
						>
							<h3 className="font-semibold mb-1 text-brand-800 dark:text-gray-100 group-hover:underline">
								{section.title}
							</h3>
							<p className="text-gray-500 dark:text-gray-400 text-sm">
								{section.description}
							</p>
							<span className="text-xs text-gray-400 dark:text-gray-500 mt-2 block">
								{section.docs.length} {section.docs.length === 1 ? 'doc' : 'docs'}
							</span>
						</Link>
						);
					})}
				</div>
			</section>

			{/* API Section */}
			{siteConfig.features.apiReference && apiSpecs.length > 0 && (
				<section className="mb-12">
					<h2 className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-4">
						{siteConfig.tabs.api.label}
					</h2>
					<div className="grid gap-4 md:grid-cols-3">
						{apiSpecs.map((spec) => (
							<Link
								key={spec.slug}
								href={`/api-reference/${spec.slug}`}
								className="border border-[var(--sidebar-border)] rounded-xl p-5 hover:border-brand-700 dark:hover:border-gray-500 transition-colors bg-white dark:bg-[#1a2420] group"
							>
								<h3 className="font-semibold mb-1 text-brand-800 dark:text-gray-100 group-hover:underline">
									{spec.title}
								</h3>
								<p className="text-gray-500 dark:text-gray-400 text-sm">
									OpenAPI specification
								</p>
							</Link>
						))}
					</div>
				</section>
			)}

			{/* Learn Section */}
			<section className="mb-12">
				<h2 className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-4">
					{siteConfig.tabs.learn.label}
				</h2>
				<div className="grid gap-4 md:grid-cols-2">
					{learnSections.map((section) => (
						<Link
							key={section.slug}
							href={section.docs[0] ? `/${section.slug}/${section.docs[0].slug}` : '#'}
							className="border border-[var(--sidebar-border)] rounded-xl p-5 hover:border-brand-700 dark:hover:border-gray-500 transition-colors bg-white dark:bg-[#1a2420] group"
						>
							<h3 className="font-semibold mb-1 text-brand-800 dark:text-gray-100 group-hover:underline">
								{section.title}
							</h3>
							<p className="text-gray-500 dark:text-gray-400 text-sm">
								{section.description}
							</p>
							<span className="text-xs text-gray-400 dark:text-gray-500 mt-2 block">
								{section.docs.length} {section.docs.length === 1 ? 'guide' : 'guides'}
							</span>
						</Link>
					))}
				</div>
			</section>
		</div>
	);
}
