import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getRemoteApiSpecs } from './remoteApiSpecs';
import { siteConfig } from '@/site.config';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export interface DocMeta {
	slug: string;
	title: string;
	description?: string;
	order?: number;
	archived?: boolean;
}

export interface DocSubsection {
	slug: string;
	title: string;
	docs: DocMeta[];
}

export interface DocSection {
	slug: string;
	title: string;
	description: string;
	docs: DocMeta[];
	archivedDocs?: DocMeta[];
	subsections?: DocSubsection[];
}

export interface DocContent extends DocMeta {
	content: string;
	section: string;
}

const SECTION_META = siteConfig.sections;

function titleFromFilename(filename: string): string {
	return filename
		.replace(/\.md$/, '')
		.replace(/[-_]/g, ' ')
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

function extractTitleFromContent(content: string, filename: string): string {
	// Try to get title from first H1
	const h1Match = content.match(/^#\s+(.+)$/m);
	if (h1Match) {
		return h1Match[1].trim();
	}
	return titleFromFilename(filename);
}

function stripFirstH1(content: string): string {
	// Remove the first H1 heading to avoid duplicate titles
	return content.replace(/^#\s+.+\n+/, '');
}

/**
 * Parse ADR status from markdown content.
 * Looks for patterns like "**Status:** Superseded" or "- Status: Deprecated"
 */
function parseAdrStatus(content: string): string | null {
	// Match "**Status:** value" or "- Status: value" or "Status: value"
	const match = content.match(/(?:\*\*)?Status:?\*?\*?\s*(.+)/i);
	return match ? match[1].trim() : null;
}

/**
 * Check if an ADR status indicates it's archived (superseded or deprecated)
 */
function isArchivedStatus(status: string | null): boolean {
	if (!status) return false;
	const lowerStatus = status.toLowerCase();
	return lowerStatus.includes('superseded') || lowerStatus.includes('deprecated');
}

/**
 * Recursively find all .md files under dirPath; returns relative path (no .md) and full file path.
 * relativePath uses forward slashes for use as slug.
 */
function findMarkdownRecursive(
	dirPath: string,
	relativePrefix: string
): { relativePath: string; filePath: string }[] {
	const result: { relativePath: string; filePath: string }[] = [];
	if (!fs.existsSync(dirPath)) return result;
	const entries = fs.readdirSync(dirPath, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = path.join(dirPath, entry.name);
		const rel = relativePrefix ? `${relativePrefix}/${entry.name}` : entry.name;
		if (entry.isDirectory()) {
			result.push(...findMarkdownRecursive(fullPath, rel));
		} else if (entry.name.endsWith('.md')) {
			result.push({
				relativePath: rel.replace(/\.md$/, ''),
				filePath: fullPath,
			});
		}
	}
	return result;
}

export async function getDocsSections(): Promise<DocSection[]> {
	const sections: DocSection[] = [];

	if (!fs.existsSync(CONTENT_DIR)) {
		return sections;
	}

	const entries = fs.readdirSync(CONTENT_DIR, { withFileTypes: true });

	for (const entry of entries) {
		if (!entry.isDirectory()) continue;
		if (entry.name === 'api') continue; // API specs handled separately

		const sectionPath = path.join(CONTENT_DIR, entry.name);
		const meta = SECTION_META[entry.name] || {
			title: titleFromFilename(entry.name),
			description: '',
			order: 99,
		};

		const docs: DocMeta[] = [];
		const archivedDocs: DocMeta[] = [];
		const subsections: DocSubsection[] = [];
		const dirContents = fs.readdirSync(sectionPath, { withFileTypes: true });
		const isAdrSection = siteConfig.features.adrTracks && entry.name === 'adr';

		// Sort helper shared by root docs and subsection docs
		const sortDocs = (a: DocMeta, b: DocMeta) => {
			if (a.order !== undefined && b.order !== undefined) {
				return a.order - b.order;
			}
			if (a.order !== undefined) return -1;
			if (b.order !== undefined) return 1;
			return a.title.localeCompare(b.title);
		};

		for (const item of dirContents) {
			if (item.isDirectory()) {
				// Scan subdirectory recursively for docs (any depth) so e.g. archive/sprint-end-*/ gets all nested .md
				const subPath = path.join(sectionPath, item.name);
				const mdFiles = findMarkdownRecursive(subPath, item.name);
				const subDocs: DocMeta[] = [];

				for (const { relativePath, filePath } of mdFiles) {
					const fileContent = fs.readFileSync(filePath, 'utf-8');
					const { data, content: mdContent } = matter(fileContent);
					const fileName = path.basename(filePath);
					subDocs.push({
						slug: relativePath.replace(/\\/g, '/'),
						title: data.title || extractTitleFromContent(mdContent, fileName),
						description: data.description,
						order: data.order,
					});
				}

				if (subDocs.length > 0) {
					subDocs.sort(sortDocs);
					subsections.push({
						slug: item.name,
						title: titleFromFilename(item.name),
						docs: subDocs,
					});
				}
				continue;
			}

			if (!item.name.endsWith('.md')) continue;

			const filePath = path.join(sectionPath, item.name);
			const fileContent = fs.readFileSync(filePath, 'utf-8');
			const { data, content } = matter(fileContent);

			// For ADR section, check if the doc is archived (superseded/deprecated)
			const status = isAdrSection ? parseAdrStatus(content) : null;
			const archived = isAdrSection && isArchivedStatus(status);

			const docMeta: DocMeta = {
				slug: item.name.replace(/\.md$/, ''),
				title: data.title || extractTitleFromContent(content, item.name),
				description: data.description,
				order: data.order,
				archived,
			};

			if (archived) {
				archivedDocs.push(docMeta);
			} else {
				docs.push(docMeta);
			}
		}

		docs.sort(sortDocs);
		archivedDocs.sort(sortDocs);
		subsections.sort((a, b) => a.title.localeCompare(b.title));

		sections.push({
			slug: entry.name,
			title: meta.title,
			description: meta.description,
			docs,
			archivedDocs: archivedDocs.length > 0 ? archivedDocs : undefined,
			subsections: subsections.length > 0 ? subsections : undefined,
		});
	}

	// Sort sections by order
	sections.sort((a, b) => {
		const orderA = SECTION_META[a.slug]?.order ?? 99;
		const orderB = SECTION_META[b.slug]?.order ?? 99;
		return orderA - orderB;
	});

	return sections;
}

export async function getDocBySlug(section: string, slug: string): Promise<DocContent | null> {
	// Slug may contain slashes for nested docs (e.g. archive/sprint-end-2026-02-13/feed-tool-exploration/feed-inline-tool-concept)
	const normalizedSlug = slug.replace(/\//g, path.sep);
	let filePath = path.join(CONTENT_DIR, section, `${normalizedSlug}.md`);

	if (!fs.existsSync(filePath)) {
		// Fallback: if slug has no slashes, search one level of subdirs (legacy)
		const sectionPath = path.join(CONTENT_DIR, section);
		if (!fs.existsSync(sectionPath)) return null;
		if (slug.includes('/')) return null;
		const entries = fs.readdirSync(sectionPath, { withFileTypes: true });
		for (const entry of entries) {
			if (!entry.isDirectory()) continue;
			const subFilePath = path.join(sectionPath, entry.name, `${slug}.md`);
			if (fs.existsSync(subFilePath)) {
				filePath = subFilePath;
				break;
			}
		}
		if (!fs.existsSync(filePath)) return null;
	}

	const fileContent = fs.readFileSync(filePath, 'utf-8');
	const { data, content } = matter(fileContent);

	return {
		slug,
		section,
		title: data.title || extractTitleFromContent(content, `${slug}.md`),
		description: data.description,
		// Strip the first H1 from content since we display title separately
		content: stripFirstH1(content),
	};
}

export async function getAllDocSlugs(): Promise<{ section: string; slug: string }[]> {
	const slugs: { section: string; slug: string }[] = [];

	if (!fs.existsSync(CONTENT_DIR)) {
		return slugs;
	}

	const entries = fs.readdirSync(CONTENT_DIR, { withFileTypes: true });

	for (const entry of entries) {
		if (!entry.isDirectory()) continue;
		if (entry.name === 'api') continue;

		const sectionPath = path.join(CONTENT_DIR, entry.name);
		const items = fs.readdirSync(sectionPath, { withFileTypes: true });

		for (const item of items) {
			if (item.isDirectory()) {
				const subPath = path.join(sectionPath, item.name);
				const mdFiles = findMarkdownRecursive(subPath, item.name);
				for (const { relativePath } of mdFiles) {
					slugs.push({
						section: entry.name,
						slug: relativePath.replace(/\\/g, '/'),
					});
				}
			} else if (item.name.endsWith('.md')) {
				slugs.push({
					section: entry.name,
					slug: item.name.replace(/\.md$/, ''),
				});
			}
		}
	}

	return slugs;
}

export interface ApiSpec {
	slug: string;
	title: string;
	specPath: string;
	kind: 'contract' | 'live';
}

export async function getApiSpecs(): Promise<ApiSpec[]> {
	const apiDir = path.join(CONTENT_DIR, 'api');
	const specs: ApiSpec[] = [];

	// Add local specs from content/api/*.openapi.yaml
	if (fs.existsSync(apiDir)) {
		const files = fs.readdirSync(apiDir);

		for (const file of files) {
			if (!file.endsWith('.openapi.yaml')) continue;

			const slug = file.replace('.openapi.yaml', '');
			specs.push({
				slug,
				title: titleFromFilename(slug).replace('V1', 'v1').replace('V2', 'v2'),
				specPath: `/api/specs/${slug}`,
				kind: 'contract',
			});
		}
	}

	// Add remote specs (e.g., Edge Functions)
	const remoteSpecs = getRemoteApiSpecs();
	for (const remote of remoteSpecs) {
		specs.push({
			slug: remote.slug,
			title: remote.title,
			specPath: `/api/specs/${remote.slug}`,
			kind: 'live',
		});
	}

	return specs;
}
