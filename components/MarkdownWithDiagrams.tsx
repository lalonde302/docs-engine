'use client';

import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import { markdownAnchorComponents, type AdrReaderLinkOptions } from '@/components/markdownAnchors';
import { MermaidDiagram } from './MermaidDiagram';

interface Segment {
	prose: string;
	diagram?: string;
}

/**
 * Split markdown content into segments of prose + optional mermaid diagram.
 * Each mermaid code block is paired with the prose that precedes it.
 */
function splitContentWithDiagrams(content: string): Segment[] {
	const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
	const diagrams: string[] = [];
	let match;

	while ((match = mermaidRegex.exec(content)) !== null) {
		diagrams.push(match[1].trim());
	}

	const proseParts = content.split(/```mermaid\n[\s\S]*?```/);
	const segments: Segment[] = [];

	for (let i = 0; i < proseParts.length; i++) {
		const prose = proseParts[i].trim();
		const diagram = diagrams[i];
		if (prose || diagram) {
			segments.push({ prose, diagram });
		}
	}

	return segments;
}

function ProseBlock({
	content,
	adrReaderPathname,
	adrReaderSlug,
	onAdrRelatedNav,
}: { content: string } & AdrReaderLinkOptions) {
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

interface MarkdownWithDiagramsProps extends AdrReaderLinkOptions {
	content: string;
}

export function MarkdownWithDiagrams({
	content,
	adrReaderPathname,
	adrReaderSlug,
	onAdrRelatedNav,
}: MarkdownWithDiagramsProps) {
	const segments = useMemo(() => splitContentWithDiagrams(content), [content]);
	const hasDiagrams = segments.some((s) => s.diagram);

	if (!hasDiagrams) {
		return (
			<ProseBlock
				content={content}
				adrReaderPathname={adrReaderPathname}
				adrReaderSlug={adrReaderSlug}
				onAdrRelatedNav={onAdrRelatedNav}
			/>
		);
	}

	return (
		<div className="diagram-content">
			{segments.map((segment, i) => (
				<div
					key={i}
					className={segment.diagram ? 'diagram-section' : 'prose-only-section'}
				>
					{segment.prose && (
						<ProseBlock
							content={segment.prose}
							adrReaderPathname={adrReaderPathname}
							adrReaderSlug={adrReaderSlug}
							onAdrRelatedNav={onAdrRelatedNav}
						/>
					)}
					{segment.diagram && (
						<div className="diagram-panel">
							<MermaidDiagram chart={segment.diagram} />
						</div>
					)}
				</div>
			))}
		</div>
	);
}
