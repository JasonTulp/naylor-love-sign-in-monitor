import {NextRequest, NextResponse} from "next/server";
import { dbConnect } from "@/lib/db-connect";
import ScanEvent from "@/models/scan-event";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '25');
        const before = searchParams.get('before');
        const after = searchParams.get('after');
        const cardNumber = searchParams.get('cardNumber');
        const name = searchParams.get("name");
        const turnstile = searchParams.get("turnstile");

        // Calculate the number of items to skip based on the page
        const skip = (page - 1) * limit;

        // Set date query based on before and after
        const query: any = {};
        if (before) {
            query.time = { $lte: new Date(before) };
        }
        if (after) {
            query.time = { ...query.time, $gte: new Date(after) };
        }
        if (cardNumber) {
            query.cardNumber = cardNumber;
        }

        // Apply name search (case-insensitive)
        if (name) {
            query.name = { $regex: name, $options: "i" };
        }
        if (turnstile) {
            // convert to number
            query.turnstile = parseInt(turnstile);
        }

        await dbConnect();

        // Fetch the paginated data
        const eventData = await ScanEvent.find(query)
            .skip(skip)
            .limit(limit);

        // Count the total number of documents to calculate total pages
        const totalEvents = await ScanEvent.countDocuments(query);

        return NextResponse.json({
            success: true,
            data: eventData,
            totalEvents,
            totalPages: Math.ceil(totalEvents / limit),  // Calculate the total number of pages
            currentPage: page,
        });
    } catch (error) {
        // @ts-ignore
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}