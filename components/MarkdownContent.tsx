'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import { markdownAnchorComponents, type AdrReaderLinkOptions } from '@/components/markdownAnchors';

interface MarkdownContentProps extends AdrReaderLinkOptions {
	content: string;
}

export function MarkdownContent({
	content,
	adrReaderPathname,
	adrReaderSlug,
	onAdrRelatedNav,
}: MarkdownContentProps) {
	const anchorComponents = markdownAnchorComponents({
		adrReaderPathname,
		adrReaderSlug,
		onAdrRelatedNav,
	});

	return (
		<div className="prose dark:prose-invert max-w-none" suppressHydrationWarning>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[rehypeRaw, rehypeSlug, rehypeHighlight]}
				components={{
					...anchorComponents,
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}
