import { NextResponse } from 'next/server';
import { getTotalFiles } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const count = await getTotalFiles();
        return NextResponse.json({ totalFiles: count });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ totalFiles: 0 }); // Fallback
    }
}
