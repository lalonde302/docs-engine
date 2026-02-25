import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getRemoteApiSpecBySlug } from '@/lib/remoteApiSpecs';

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> }
) {
	const { slug } = await params;

	// First, try to find a local spec file
	const specPath = path.join(process.cwd(), 'content', 'api', `${slug}.openapi.yaml`);

	if (fs.existsSync(specPath)) {
		const content = fs.readFileSync(specPath, 'utf-8');

		return new NextResponse(content, {
			headers: {
				'Content-Type': 'text/yaml; charset=utf-8',
				'Cache-Control': 'public, max-age=3600',
			},
		});
	}

	// If no local file, check for a remote spec
	const remoteSpec = getRemoteApiSpecBySlug(slug);

	if (remoteSpec) {
		try {
			const response = await fetch(remoteSpec.url, {
				headers: {
					Accept: 'application/json, application/openapi+json',
					...(remoteSpec.headers ?? {}),
				},
				// Cache the fetch for 5 minutes on the server side
				next: { revalidate: 300 },
			});

			if (!response.ok) {
				console.error(`Failed to fetch remote spec from ${remoteSpec.url}: ${response.status}`);
				return NextResponse.json(
					{ error: 'Failed to fetch remote spec' },
					{ status: 502 }
				);
			}

			const specContent = await response.text();

			return new NextResponse(specContent, {
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					// Cache for 5 minutes, allow stale content while revalidating
					'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
				},
			});
		} catch (error) {
			console.error(`Error fetching remote spec ${slug}:`, error);
			return NextResponse.json(
				{ error: 'Failed to fetch remote spec' },
				{ status: 502 }
			);
		}
	}

	return new NextResponse('Spec not found', { status: 404 });
}
