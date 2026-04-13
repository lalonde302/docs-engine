import { NextRequest, NextResponse } from 'next/server';
import { getDocBySlug } from '@/lib/docs';

function isSafeDocSlug(slug: string): boolean {
	if (!slug || slug.length > 256) return false;
	if (slug.includes('..')) return false;
	if (slug.startsWith('/') || slug.startsWith('\\')) return false;
	// Allow nested archive paths; forbid Windows separators after normalize
	if (/[\u0000-\u001f]/.test(slug)) return false;
	return /^[a-zA-Z0-9][a-zA-Z0-9/_-]*$/.test(slug);
}

function isSafeSection(section: string): boolean {
	if (!section || section === 'api') return false;
	return /^[a-zA-Z0-9_-]+$/.test(section);
}

/**
 * JSON for client-side doc preview (ADR panel). Restricted to same validation as filesystem reads.
 */
export async function GET(req: NextRequest) {
	const section = req.nextUrl.searchParams.get('section');
	const slug = req.nextUrl.searchParams.get('slug');

	if (!section || !slug) {
		return NextResponse.json({ error: 'Missing section or slug' }, { status: 400 });
	}

	if (!isSafeSection(section) || !isSafeDocSlug(slug)) {
		return NextResponse.json({ error: 'Invalid section or slug' }, { status: 400 });
	}

	const doc = await getDocBySlug(section, slug);
	if (!doc) {
		return NextResponse.json({ error: 'Not found' }, { status: 404 });
	}

	return NextResponse.json({
		title: doc.title,
		description: doc.description ?? null,
		content: doc.content,
		section: doc.section,
		slug: doc.slug,
	});
}
