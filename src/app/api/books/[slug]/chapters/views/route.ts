import { NextResponse } from 'next/server';

// Placeholder route: this path is not used. Kept only to avoid build errors if present.
// Consider deleting this file if not needed.
export async function GET() {
	return NextResponse.json({ error: 'Not implemented' }, { status: 404 });
}

