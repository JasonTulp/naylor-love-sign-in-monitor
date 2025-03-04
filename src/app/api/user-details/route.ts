import {NextRequest, NextResponse} from "next/server";
import { dbConnect } from "@/lib/db-connect";
import ScanEvent from "@/models/scan-event";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const eventData = await ScanEvent.find();
        return NextResponse.json({ success: true, data: eventData });
    } catch (error) {
        // @ts-ignore
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}