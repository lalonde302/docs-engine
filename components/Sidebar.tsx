'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { siteConfig } from '@/site.config';

interface DocMeta {
	slug: string;
	title: string;
	archived?: boolean;
}

interface Subsection {
	slug: string;
	title: string;
	docs: DocMeta[];
}

interface Section {
	slug: string;
	title: string;
	docs: DocMeta[];
	archivedDocs?: DocMeta[];
	subsections?: Subsection[];
}

interface ApiSpec {
	slug: string;
	title: string;
	kind?: 'contract' | 'live';
}

interface ApiEndpoint {
	method: string;
	path: string;
	summary: string;
	operationId?: string;
}

interface ApiEndpointGroup {
	tag: string;
	description?: string;
	endpoints: ApiEndpoint[];
}

interface ApiStructure {
	title: string;
	groups: ApiEndpointGroup[];
}

// Method color mapping
const METHOD_COLORS: Record<string, string> = {
	GET: 'text-green-600 dark:text-green-400',
	POST: 'text-blue-600 dark:text-blue-400',
	PUT: 'text-orange-600 dark:text-orange-400',
	PATCH: 'text-yellow-600 dark:text-yellow-400',
	DELETE: 'text-red-600 dark:text-red-400',
};

const LEARN_SECTIONS = siteConfig.tabs.learn.sections;
const DOCS_SECTIONS = siteConfig.tabs.docs.sections;
const ARCHIVE_SECTIONS = siteConfig.tabs.archive.sections;

// Chevron icon component
function ChevronIcon({ expanded }: { expanded: boolean }) {
	return (
		<svg
			className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
		</svg>
	);
}

interface SidebarProps {
	isOpen?: boolean;
	onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
	const pathname = usePathname();
	const [sections, setSections] = useState<Section[]>([]);
	const [apiSpecs, setApiSpecs] = useState<ApiSpec[]>([]);
	const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
	const [apiStructures, setApiStructures] = useState<Record<string, ApiStructure>>({});
	const [loadingSpecs, setLoadingSpecs] = useState<Set<string>>(new Set());

	// All hooks must be called before any conditional returns
	useEffect(() => {
		fetch('/api/nav')
			.then((res) => res.json())
			.then((data) => {
				setSections(data.sections || []);
				setApiSpecs(data.apiSpecs || []);
			})
			.catch(console.error);
	}, []);

	// Fetch API structure when a spec is expanded
	const fetchApiStructure = (slug: string) => {
		if (apiStructures[slug] || loadingSpecs.has(slug)) return;

		setLoadingSpecs((prev) => new Set([...prev, slug]));
		fetch(`/api/spec-structure/${slug}`)
			.then((res) => res.json())
			.then((data) => {
				if (!data.error) {
					setApiStructures((prev) => ({ ...prev, [slug]: data }));
				}
			})
			.catch(console.error)
			.finally(() => {
				setLoadingSpecs((prev) => {
					const next = new Set(prev);
					next.delete(slug);
					return next;
				});
			});
	};

	// Auto-expand section (and subsection) containing current page
	useEffect(() => {
		if (pathname) {
			const pathParts = pathname.split('/');
			const currentSection = pathParts[1];
			if (currentSection === 'api-reference') {
				setExpandedSections((prev) => new Set([...prev, 'api-reference']));
			} else if (currentSection) {
				setExpandedSections((prev) => {
					const next = new Set(prev);
					next.add(currentSection);
					// Auto-expand subsection when path has 3+ segments (e.g. /reference/personas/maria-kowalski)
					if (pathParts.length >= 4) {
						const subsectionSlug = pathParts[2];
						next.add(`${currentSection}-${subsectionSlug}`);
					}
					if (next.size === prev.size && [...next].every((k) => prev.has(k))) return prev;
					return next;
				});
			}
		}
	}, [pathname]);

	const toggleSection = (slug: string) => {
		setExpandedSections((prev) => {
			const next = new Set(prev);
			if (next.has(slug)) {
				next.delete(slug);
			} else {
				next.add(slug);
			}
			return next;
		});
	};

	// Don't render sidebar on auth pages or when closed
	if (pathname?.startsWith('/auth') || !isOpen) {
		return null;
	}

	// Filter sections by tab
	const learnSections = sections.filter((s) => LEARN_SECTIONS.includes(s.slug));
	const docsSections = sections.filter((s) => DOCS_SECTIONS.includes(s.slug));
	const archiveSections = sections.filter((s) => ARCHIVE_SECTIONS.includes(s.slug));

	// Determine active tab based on current path
	const currentSection = pathname?.split('/')[1];
	const isApiPage = pathname?.startsWith('/api-reference');
	const isLearnPage = LEARN_SECTIONS.includes(currentSection || '') || pathname === '/learn';
	const isArchivePage = ARCHIVE_SECTIONS.includes(currentSection || '') || pathname === '/archive';
	const isDocsPage = !isApiPage && !isLearnPage && !isArchivePage;

	// Get first doc from each tab for default links
	const firstLearnDoc = learnSections[0]?.docs[0];
	const firstDocsDoc = docsSections[0]?.docs[0];
	const archiveSection = archiveSections[0];
	const firstArchiveDoc =
		archiveSection?.docs[0] ?? archiveSection?.subsections?.[0]?.docs?.[0];

	return (
		<aside className="w-64 border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] flex flex-col h-screen sticky top-0">
			{/* Header with logo and nav */}
			<div className="p-4 border-b border-[var(--sidebar-border)]">
				<div className="flex items-center justify-between mb-4">
					<Link href="/" className="flex items-center gap-2">
						<div className="w-6 h-6 bg-brand-800 dark:bg-brand-700 rounded flex items-center justify-center">
							<span className="text-white text-xs font-bold">{siteConfig.shortName}</span>
						</div>
						<span className="font-bold text-brand-800 dark:text-gray-100">{siteConfig.name.toUpperCase()}</span>
					</Link>
					<div className="flex items-center gap-2">
						<ThemeToggle />
						{onClose && (
							<button
								onClick={onClose}
								className="p-1.5 rounded-lg hover:bg-[var(--code-bg)] transition-colors"
								aria-label="Close sidebar"
							>
								<svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
								</svg>
							</button>
						)}
					</div>
				</div>
				
				{/* Navigation tabs */}
				<div className="flex gap-4 text-sm">
					<Link
						href={firstDocsDoc ? `/${docsSections[0].slug}/${firstDocsDoc.slug}` : '/'}
						className={`pb-1 transition-colors ${
							isDocsPage
								? 'text-brand-800 dark:text-white border-b-2 border-brand-800 dark:border-primary-400 font-medium'
								: 'text-gray-500 dark:text-gray-400 hover:text-brand-700 dark:hover:text-gray-200'
						}`}
					>
						{siteConfig.tabs.docs.label}
					</Link>
					{siteConfig.features.apiReference && (
						<Link
							href={apiSpecs.length > 0 ? `/api-reference/${apiSpecs[0].slug}` : '#'}
							className={`pb-1 transition-colors ${
								isApiPage
									? 'text-brand-800 dark:text-white border-b-2 border-brand-800 dark:border-primary-400 font-medium'
									: 'text-gray-500 dark:text-gray-400 hover:text-brand-700 dark:hover:text-gray-200'
							}`}
						>
							{siteConfig.tabs.api.label}
						</Link>
					)}
					<Link
						href={firstLearnDoc ? `/${learnSections[0].slug}/${firstLearnDoc.slug}` : '/'}
						className={`pb-1 transition-colors ${
							isLearnPage
								? 'text-brand-800 dark:text-white border-b-2 border-brand-800 dark:border-primary-400 font-medium'
								: 'text-gray-500 dark:text-gray-400 hover:text-brand-700 dark:hover:text-gray-200'
						}`}
					>
						{siteConfig.tabs.learn.label}
					</Link>
					<Link
						href={firstArchiveDoc ? `/${archiveSection?.slug}/${firstArchiveDoc.slug}` : '/'}
						className={`pb-1 transition-colors ${
							isArchivePage
								? 'text-brand-800 dark:text-white border-b-2 border-brand-800 dark:border-primary-400 font-medium'
								: 'text-gray-500 dark:text-gray-400 hover:text-brand-700 dark:hover:text-gray-200'
						}`}
					>
						{siteConfig.tabs.archive.label}
					</Link>
				</div>
			</div>

			{/* Navigation */}
			<nav className="flex-1 overflow-y-auto py-4">
				{isDocsPage && (
					<>
						{docsSections.map((section) => {
							const isExpanded = expandedSections.has(section.slug);
							const archivedKey = `${section.slug}-archived`;
							const isArchivedExpanded = expandedSections.has(archivedKey);
							const hasArchivedDocs = section.archivedDocs && section.archivedDocs.length > 0;

							return (
								<div key={section.slug} className="mb-2">
									<button
										onClick={() => toggleSection(section.slug)}
										className="w-full px-4 py-1.5 flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
									>
										<ChevronIcon expanded={isExpanded} />
										{section.title}
									</button>
									{isExpanded && (
										<>
											<ul className="mt-1">
												{siteConfig.features.adrTracks && section.slug === 'adr' && (
													<li>
														<Link
															href="/adr"
															className={`block pl-9 pr-4 py-1.5 text-sm transition-colors ${
																pathname === '/adr'
																	? 'text-brand-800 dark:text-white font-medium'
																	: 'text-gray-600 dark:text-gray-400 hover:text-brand-700 dark:hover:text-gray-200'
															}`}
														>
															ADR Homepage
														</Link>
													</li>
												)}
												{section.docs.map((doc) => {
													const href = `/${section.slug}/${doc.slug}`;
													const isActive = pathname === href;
													return (
														<li key={doc.slug}>
															<Link
																href={href}
																className={`block pl-9 pr-4 py-1.5 text-sm transition-colors ${
																	isActive
																		? 'text-brand-800 dark:text-white font-medium'
																		: 'text-gray-600 dark:text-gray-400 hover:text-brand-700 dark:hover:text-gray-200'
																}`}
															>
																{doc.title}
															</Link>
														</li>
													);
												})}
											</ul>
											{/* Subsections (subdirectories) */}
											{section.subsections?.map((sub) => {
												const subKey = `${section.slug}-${sub.slug}`;
												const isSubExpanded = expandedSections.has(subKey);
												return (
													<div key={sub.slug} className="mt-1">
														<button
															onClick={() => toggleSection(subKey)}
															className="w-full pl-7 pr-4 py-1 flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
														>
															<ChevronIcon expanded={isSubExpanded} />
															{sub.title}
														</button>
														{isSubExpanded && (
															<ul className="mt-1">
																{sub.docs.map((doc) => {
																	const href = `/${section.slug}/${doc.slug}`;
																	const isActive = pathname === href;
																	return (
																		<li key={doc.slug}>
																			<Link
																				href={href}
																				className={`block pl-12 pr-4 py-1.5 text-sm transition-colors ${
																					isActive
																						? 'text-brand-800 dark:text-white font-medium'
																						: 'text-gray-600 dark:text-gray-400 hover:text-brand-700 dark:hover:text-gray-200'
																				}`}
																			>
																				{doc.title}
																			</Link>
																		</li>
																	);
																})}
															</ul>
														)}
													</div>
												);
											})}
											{/* Archived subsection */}
											{hasArchivedDocs && (
												<div className="mt-2">
													<button
														onClick={() => toggleSection(archivedKey)}
														className="w-full pl-7 pr-4 py-1 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
													>
														<ChevronIcon expanded={isArchivedExpanded} />
														Archived
													</button>
													{isArchivedExpanded && (
														<ul className="mt-1">
															{section.archivedDocs!.map((doc) => {
																const href = `/${section.slug}/${doc.slug}`;
																const isActive = pathname === href;
																return (
																	<li key={doc.slug}>
																		<Link
																			href={href}
																			className={`block pl-12 pr-4 py-1.5 text-sm transition-colors ${
																				isActive
																					? 'text-gray-600 dark:text-gray-300 font-medium'
																					: 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
																			}`}
																		>
																			{doc.title}
																		</Link>
																	</li>
																);
															})}
														</ul>
													)}
												</div>
											)}
										</>
									)}
								</div>
							);
						})}
					</>
				)}

				{isApiPage && (() => {
					const contractSpecs = apiSpecs.filter((s) => s.kind !== 'live');
					const liveSpecs = apiSpecs.filter((s) => s.kind === 'live');

					const renderSpecList = (specList: ApiSpec[]) =>
						specList.map((spec) => {
							const href = `/api-reference/${spec.slug}`;
							const isActive = pathname === href;
							const specKey = `api-spec-${spec.slug}`;
							const isExpanded = expandedSections.has(specKey);
							const structure = apiStructures[spec.slug];
							const isLoading = loadingSpecs.has(spec.slug);

							return (
								<div key={spec.slug} className="mb-1">
									<div className="flex items-center">
										<button
											onClick={() => {
												toggleSection(specKey);
												if (!isExpanded) {
													fetchApiStructure(spec.slug);
												}
											}}
											className="pl-4 pr-1 py-1.5 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
										>
											<ChevronIcon expanded={isExpanded} />
										</button>
										<Link
											href={href}
											className={`flex-1 pr-4 py-1.5 text-sm transition-colors ${
												isActive
													? 'text-brand-800 dark:text-white font-bold underline'
													: 'text-gray-600 dark:text-gray-400 hover:text-brand-700 dark:hover:text-gray-200'
											}`}
										>
											{spec.title}
										</Link>
									</div>
									{isExpanded && (
										<div className="ml-4">
											{isLoading && (
												<div className="pl-5 py-1 text-xs text-gray-500">Loading...</div>
											)}
											{structure && (
												<ul className="mt-0.5">
													{structure.groups.flatMap((group) =>
														group.endpoints.map((endpoint, idx) => (
															<li key={`${endpoint.method}-${endpoint.path}-${idx}`}>
																<a
																	href={`#${endpoint.operationId || `${endpoint.method.toLowerCase()}-${endpoint.path.replace(/[{}\/]/g, '-')}`}`}
																	className="block pl-5 pr-4 py-1 text-sm transition-colors text-gray-600 dark:text-gray-400 hover:text-brand-700 dark:hover:text-gray-200"
																>
																	<span className={`font-mono text-[10px] mr-1.5 ${METHOD_COLORS[endpoint.method] || ''}`}>
																		{endpoint.method}
																	</span>
																	<span className="text-xs">{endpoint.summary}</span>
																</a>
															</li>
														))
													)}
												</ul>
											)}
										</div>
									)}
								</div>
							);
						});

					return (
						<div className="mb-2">
							<div className="px-4 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider">
								API Specs
							</div>
							{contractSpecs.length > 0 && (
								<>
									<div className="pl-4 pr-4 pt-2 pb-0.5 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider">
										Contracts
									</div>
									{renderSpecList(contractSpecs)}
								</>
							)}
							{liveSpecs.length > 0 && (
								<>
									<div className="pl-4 pr-4 pt-2 pb-0.5 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider">
										Live
									</div>
									{renderSpecList(liveSpecs)}
								</>
							)}
						</div>
					);
				})()}

				{isLearnPage && (
					<>
						{learnSections.map((section) => {
							const isExpanded = expandedSections.has(section.slug);
							return (
								<div key={section.slug} className="mb-2">
									<button
										onClick={() => toggleSection(section.slug)}
										className="w-full px-4 py-1.5 flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
									>
										<ChevronIcon expanded={isExpanded} />
										{section.title}
									</button>
									{isExpanded && (
										<>
											<ul className="mt-1">
												{section.docs.map((doc) => {
													const href = `/${section.slug}/${doc.slug}`;
													const isActive = pathname === href;
													return (
														<li key={doc.slug}>
															<Link
																href={href}
																className={`block pl-9 pr-4 py-1.5 text-sm transition-colors ${
																	isActive
																		? 'text-brand-800 dark:text-white font-medium'
																		: 'text-gray-600 dark:text-gray-400 hover:text-brand-700 dark:hover:text-gray-200'
																}`}
															>
																{doc.title}
															</Link>
														</li>
													);
												})}
											</ul>
											{section.subsections?.map((sub) => {
												const subKey = `${section.slug}-${sub.slug}`;
												const isSubExpanded = expandedSections.has(subKey);
												return (
													<div key={sub.slug} className="mt-1">
														<button
															onClick={() => toggleSection(subKey)}
															className="w-full pl-7 pr-4 py-1 flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
														>
															<ChevronIcon expanded={isSubExpanded} />
															{sub.title}
														</button>
														{isSubExpanded && (
															<ul className="mt-1">
																{sub.docs.map((doc) => {
																	const href = `/${section.slug}/${doc.slug}`;
																	const isActive = pathname === href;
																	return (
																		<li key={doc.slug}>
																			<Link
																				href={href}
																				className={`block pl-12 pr-4 py-1.5 text-sm transition-colors ${
																					isActive
																						? 'text-brand-800 dark:text-white font-medium'
																						: 'text-gray-600 dark:text-gray-400 hover:text-brand-700 dark:hover:text-gray-200'
																				}`}
																			>
																				{doc.title}
																			</Link>
																		</li>
																	);
																})}
															</ul>
														)}
													</div>
												);
											})}
										</>
									)}
								</div>
							);
						})}
					</>
				)}

				{isArchivePage && (() => {
					const archiveSection = archiveSections[0];
					if (!archiveSection) return null;

					return (
						<>
							{/* Root-level archive docs (e.g. About the Archive) */}
							{archiveSection.docs.length > 0 && (
								<ul className="mb-2">
									{archiveSection.docs.map((doc) => {
										const href = `/archive/${doc.slug}`;
										const isActive = pathname === href;
										return (
											<li key={doc.slug}>
												<Link
													href={href}
													className={`block px-4 py-1.5 text-sm transition-colors ${
														isActive
															? 'text-brand-800 dark:text-white font-medium'
															: 'text-gray-600 dark:text-gray-400 hover:text-brand-700 dark:hover:text-gray-200'
													}`}
												>
													{doc.title}
												</Link>
											</li>
										);
									})}
								</ul>
							)}

							{/* Subdirectory sections (collapsible) */}
							{archiveSection.subsections?.map((sub) => {
								const subKey = `archive-${sub.slug}`;
								const isExpanded = expandedSections.has(subKey);
								return (
									<div key={sub.slug} className="mb-2">
										<button
											onClick={() => toggleSection(subKey)}
											className="w-full px-4 py-1.5 flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
										>
											<ChevronIcon expanded={isExpanded} />
											{sub.title}
										</button>
										{isExpanded && (
											<ul className="mt-1">
												{sub.docs.map((doc) => {
													const href = `/archive/${doc.slug}`;
													const isActive = pathname === href;
													return (
														<li key={doc.slug}>
															<Link
																href={href}
																className={`block pl-9 pr-4 py-1.5 text-sm transition-colors ${
																	isActive
																		? 'text-brand-800 dark:text-white font-medium'
																		: 'text-gray-600 dark:text-gray-400 hover:text-brand-700 dark:hover:text-gray-200'
																}`}
															>
																{doc.title}
															</Link>
														</li>
													);
												})}
											</ul>
										)}
									</div>
								);
							})}
						</>
					);
				})()}
			</nav>
		</aside>
	);
}
