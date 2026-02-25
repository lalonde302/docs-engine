'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

let diagramCounter = 0;

interface MermaidDiagramProps {
	chart: string;
}

const SHARED_THEME_VARS = {
	fontFamily: 'system-ui, -apple-system, sans-serif',
	fontSize: '13px',
};

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
	const [svg, setSvg] = useState<string>('');
	const [error, setError] = useState<string>('');
	const idRef = useRef(`mermaid-${++diagramCounter}`);
	const renderCountRef = useRef(0);

	const renderDiagram = useCallback(async () => {
		try {
			const mermaid = (await import('mermaid')).default;
			const isDark = document.documentElement.classList.contains('dark');

			mermaid.initialize({
				startOnLoad: false,
				theme: isDark ? 'dark' : 'default',
				securityLevel: 'loose',
				themeVariables: SHARED_THEME_VARS,
			});

			const id = `${idRef.current}-${++renderCountRef.current}`;
			const { svg: renderedSvg } = await mermaid.render(id, chart);
			setSvg(renderedSvg);
			setError('');
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Failed to render diagram');
		}
	}, [chart]);

	useEffect(() => {
		renderDiagram();

		// Re-render on dark mode toggle
		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (mutation.attributeName === 'class') {
					renderDiagram();
				}
			}
		});

		observer.observe(document.documentElement, { attributes: true });
		return () => observer.disconnect();
	}, [renderDiagram]);

	if (error) {
		return (
			<div className="text-xs text-red-500 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
				<span className="font-medium">Diagram error:</span> {error}
			</div>
		);
	}

	if (!svg) {
		return (
			<div className="animate-pulse bg-gray-100 dark:bg-gray-800/50 rounded-lg h-48" />
		);
	}

	return (
		<div
			className="mermaid-diagram [&>svg]:w-full [&>svg]:h-auto"
			dangerouslySetInnerHTML={{ __html: svg }}
		/>
	);
}
