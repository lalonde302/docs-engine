/**
 * Resolve markdown link hrefs to ADR doc routes (/adr/:slug) for in-app navigation / preview.
 * Uses the current doc pathname (e.g. `/adr/adr-0004-security-model`) so resolution is
 * identical on server and client — no `window` dependency.
 */

export interface AdrLinkTarget {
	slug: string;
	hash?: string;
}

const PLACEHOLDER_ORIGIN = 'https://docs.invalid';

/**
 * From an authored href and the current ADR pathname (`/adr/:slug`), return ADR slug + hash
 * if the link targets an ADR path. Returns null for non-ADR paths.
 */
export function resolveAdrLinkTarget(href: string, pagePathname: string): AdrLinkTarget | null {
	if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) return null;

	try {
		if (href.startsWith('#')) {
			const onAdr = pagePathname.match(/^\/adr\/([^/]+)$/);
			if (!onAdr) return null;
			const hash = href.slice(1);
			return { slug: onAdr[1], hash: hash || undefined };
		}

		if (/^https?:\/\//i.test(href)) {
			const u = new URL(href);
			const path = u.pathname.replace(/\/$/, '') || '/';
			const match = path.match(/^\/adr\/([^/]+)$/);
			if (!match) return null;
			let slug = match[1];
			if (slug.endsWith('.md')) {
				slug = slug.slice(0, -3);
			}
			if (!slug) return null;
			const hash = u.hash ? u.hash.slice(1) : undefined;
			return { slug, hash: hash || undefined };
		}

		const resolved = new URL(href, `${PLACEHOLDER_ORIGIN}${pagePathname}`);
		const path = resolved.pathname.replace(/\/$/, '') || '/';
		const match = path.match(/^\/adr\/([^/]+)$/);
		if (!match) return null;

		let slug = match[1];
		if (slug.endsWith('.md')) {
			slug = slug.slice(0, -3);
		}
		if (!slug) return null;

		const hash = resolved.hash ? resolved.hash.slice(1) : undefined;
		return { slug, hash: hash || undefined };
	} catch {
		return null;
	}
}
