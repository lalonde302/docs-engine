/**
 * Remote API Specs Registry
 *
 * Defines API specifications that are served from remote URLs (not local files).
 * These specs are proxied through our API routes so Scalar can render them.
 */

export interface RemoteApiSpec {
	slug: string;
	title: string;
	url: string;
	headers?: Record<string, string>;
	description?: string;
}

/**
 * Registry of remote OpenAPI specifications.
 * Add entries here for APIs that serve their own OpenAPI specs at runtime.
 */
export function getRemoteApiSpecs(): RemoteApiSpec[] {
	const specs: RemoteApiSpec[] = [];

	// Supabase REST API (PostgREST auto-generated OpenAPI spec)
	// Fetched live from the Supabase project so schema changes are reflected immediately
	const supabaseUrl = process.env.SUPABASE_URL;
	const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
	if (supabaseUrl && supabaseAnonKey) {
		specs.push({
			slug: 'supabase-rest',
			title: 'Supabase REST API',
			url: `${supabaseUrl}/rest/v1/?apikey=${encodeURIComponent(supabaseAnonKey)}`,
			headers: {
				apikey: supabaseAnonKey,
				Authorization: `Bearer ${supabaseAnonKey}`,
			},
			description: 'Auto-generated PostgREST API for database tables, views, and functions.',
		});
	}

	// Edge Functions OpenAPI spec (served by the openapi Edge Function)
	const edgeFunctionsUrl = process.env.SUPABASE_EDGE_OPENAPI_URL;
	if (edgeFunctionsUrl) {
		let headers: Record<string, string> | undefined;
		if (supabaseAnonKey) {
			headers = {
				apikey: supabaseAnonKey,
				Authorization: `Bearer ${supabaseAnonKey}`,
			};
		}
		specs.push({
			slug: 'edge-functions',
			title: 'Edge Functions',
			url: edgeFunctionsUrl,
			headers,
			description: 'Supabase Edge Functions API for lesson search, recommendations, and interactions.',
		});
	}

	return specs;
}

/**
 * Look up a remote spec by slug.
 * Returns undefined if the slug doesn't match a remote spec.
 */
export function getRemoteApiSpecBySlug(slug: string): RemoteApiSpec | undefined {
	return getRemoteApiSpecs().find((spec) => spec.slug === slug);
}
