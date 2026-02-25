import { NextResponse } from 'next/server';
import { getDocsSections, getApiSpecs } from '@/lib/docs';

export async function GET() {
	const [sections, apiSpecs] = await Promise.all([
		getDocsSections(),
		getApiSpecs(),
	]);

	return NextResponse.json({ sections, apiSpecs });
}
