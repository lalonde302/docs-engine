import type { Components } from 'react-markdown';
import { resolveAdrLinkTarget } from '@/lib/adrLinkResolve';

export interface AdrReaderLinkOptions {
	/** Current doc pathname, e.g. `/adr/adr-0004-security-model` (used to resolve relative links). */
	adrReaderPathname?: string;
	adrReaderSlug?: string;
	onAdrRelatedNav?: (slug: string, hash?: string) => void;
}

/**
 * Rich markdown anchors: optional ADR reader mode opens related ADRs in the side panel
 * (primary click); modified clicks keep default behavior. External links open in a new tab.
 */
export function markdownAnchorComponents(
	opts: AdrReaderLinkOptions
): Partial<Components> {
	const { adrReaderPathname, adrReaderSlug, onAdrRelatedNav } = opts;

	return {
		a: ({ href, children, ...props }) => {
			if (!href) {
				return <a {...props}>{children}</a>;
			}

			const adrTarget =
				adrReaderSlug && adrReaderPathname && onAdrRelatedNav
					? resolveAdrLinkTarget(href, adrReaderPathname)
					: null;

			if (adrTarget && onAdrRelatedNav) {
				const canonicalHref = `/adr/${adrTarget.slug}${adrTarget.hash ? `#${adrTarget.hash}` : ''}`;

				if (adrTarget.slug === adrReaderSlug) {
					return (
						<a href={canonicalHref} {...props}>
							{children}
						</a>
					);
				}

				return (
					<a
						href={canonicalHref}
						{...props}
						onClick={(e) => {
							if (e.defaultPrevented) return;
							if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
							e.preventDefault();
							onAdrRelatedNav(adrTarget.slug, adrTarget.hash);
						}}
					>
						{children}
					</a>
				);
			}

			const isHttp = /^https?:\/\//i.test(href);
			if (isHttp) {
				return (
					<a href={href} target="_blank" rel="noopener noreferrer" {...props}>
						{children}
					</a>
				);
			}

			return (
				<a href={href} {...props}>
					{children}
				</a>
			);
		},
	};
}
