import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { getRemoteApiSpecBySlug } from '@/lib/remoteApiSpecs';

interface OpenAPIOperation {
	summary?: string;
	description?: string;
	operationId?: string;
	tags?: string[];
}

interface OpenAPIPath {
	get?: OpenAPIOperation;
	post?: OpenAPIOperation;
	put?: OpenAPIOperation;
	patch?: OpenAPIOperation;
	delete?: OpenAPIOperation;
	options?: OpenAPIOperation;
	head?: OpenAPIOperation;
}

interface OpenAPISpec {
	info?: {
		title?: string;
	};
	tags?: Array<{
		name: string;
		description?: string;
	}>;
	paths?: Record<string, OpenAPIPath>;
}

interface EndpointGroup {
	tag: string;
	description?: string;
	endpoints: Array<{
		method: string;
		path: string;
		summary: string;
		operationId?: string;
	}>;
}

/**
 * Parse an OpenAPI spec and extract endpoint groups by tag.
 */
function extractEndpointGroups(spec: OpenAPISpec, fallbackTitle: string) {
	const groups: Map<string, EndpointGroup> = new Map();
	const methods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'] as const;

	// Initialize groups from tags if defined
	if (spec.tags) {
		for (const tag of spec.tags) {
			groups.set(tag.name, {
				tag: tag.name,
				description: tag.description,
				endpoints: [],
			});
		}
	}

	// Process paths
	if (spec.paths) {
		for (const [pathStr, pathObj] of Object.entries(spec.paths)) {
			for (const method of methods) {
				const operation = pathObj[method];
				if (operation) {
					const tags = operation.tags || ['default'];
					for (const tag of tags) {
						if (!groups.has(tag)) {
							groups.set(tag, { tag, endpoints: [] });
						}
						groups.get(tag)!.endpoints.push({
							method: method.toUpperCase(),
							path: pathStr,
							summary: operation.summary || `${method.toUpperCase()} ${pathStr}`,
							operationId: operation.operationId,
						});
					}
				}
			}
		}
	}

	return {
		title: spec.info?.title || fallbackTitle,
		groups: Array.from(groups.values()).filter((g) => g.endpoints.length > 0),
	};
}

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ slug: string }> }
) {
	const { slug } = await params;
	const contentDir = path.join(process.cwd(), 'content');

	// First, try to find a local spec file
	let specPath: string | null = null;
	const dirs = ['reference', 'api'];

	for (const dir of dirs) {
		const dirPath = path.join(contentDir, dir);
		try {
			const files = await fs.readdir(dirPath);
			const specFile = files.find(
				(f) => f.endsWith('.openapi.yaml') && f.replace('.openapi.yaml', '') === slug
			);
			if (specFile) {
				specPath = path.join(dirPath, specFile);
				break;
			}
		} catch {
			continue;
		}
	}

	// Also check root content dir
	if (!specPath) {
		try {
			const files = await fs.readdir(contentDir);
			const specFile = files.find(
				(f) => f.endsWith('.openapi.yaml') && f.replace('.openapi.yaml', '') === slug
			);
			if (specFile) {
				specPath = path.join(contentDir, specFile);
			}
		} catch {
			// ignore
		}
	}

	// If local file found, parse it
	if (specPath) {
		try {
			const content = await fs.readFile(specPath, 'utf-8');
			const spec = yaml.load(content) as OpenAPISpec;
			return NextResponse.json(extractEndpointGroups(spec, slug));
		} catch (error) {
			console.error('Error parsing local spec:', error);
			return NextResponse.json({ error: 'Failed to parse spec' }, { status: 500 });
		}
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
			// js-yaml can parse JSON as well as YAML
			const spec = yaml.load(specContent) as OpenAPISpec;

			return NextResponse.json(extractEndpointGroups(spec, remoteSpec.title));
		} catch (error) {
			console.error(`Error fetching remote spec ${slug}:`, error);
			return NextResponse.json(
				{ error: 'Failed to fetch remote spec' },
				{ status: 502 }
			);
		}
	}

	return NextResponse.json({ error: 'Spec not found' }, { status: 404 });
}
