'use client';

import dynamic from 'next/dynamic';

const ScalarEmbed = dynamic(
	() => import('@/components/ScalarEmbed').then((mod) => ({ default: mod.ScalarEmbed })),
	{
		ssr: false,
		loading: () => (
			<div className="h-screen flex items-center justify-center text-gray-500">
				Loading API Reference…
			</div>
		),
	}
);

interface ScalarEmbedClientProps {
	specUrl: string;
	title: string;
}

export function ScalarEmbedClient({ specUrl, title }: ScalarEmbedClientProps) {
	return <ScalarEmbed specUrl={specUrl} title={title} />;
}
