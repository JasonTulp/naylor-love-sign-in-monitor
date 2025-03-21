import { NextRequest, NextResponse } from 'next/server';
import { migrateEvents } from '@/lib/migrate-events';

export async function POST(req: NextRequest) {
    return NextResponse.json(
        { success: false, error: 'No migrations allowed at the moment thanks' },
        { status: 500 }
    );
    // try {
    //     const result = await migrateEvents();
    //     return NextResponse.json(result);
    // } catch (error) {
    //     return NextResponse.json(
    //         { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' },
    //         { status: 500 }
    //     );
    // }
} 