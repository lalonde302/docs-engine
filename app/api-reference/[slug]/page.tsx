import { notFound } from 'next/navigation';
import { getApiSpecs } from '@/lib/docs';
import { ScalarEmbedClient } from '@/components/ScalarEmbedClient';
import { siteConfig } from '@/site.config';

interface PageProps {
	params: Promise<{
		slug: string;
	}>;
}

export async function generateStaticParams() {
	const specs = await getApiSpecs();
	return specs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
	const { slug } = await params;
	const specs = await getApiSpecs();
	const spec = specs.find((s) => s.slug === slug);

	if (!spec) {
		return { title: 'Not Found' };
	}

	return {
		title: `${spec.title} | API Reference | ${siteConfig.titleSuffix}`,
	};
}

export default async function ApiReferencePage({ params }: PageProps) {
	const { slug } = await params;
	const specs = await getApiSpecs();
	const spec = specs.find((s) => s.slug === slug);

	if (!spec) {
		notFound();
	}

	return (
		<div className="h-screen">
			<ScalarEmbedClient specUrl={`/api/specs/${slug}`} title={spec.title} />
		</div>
	);
}
