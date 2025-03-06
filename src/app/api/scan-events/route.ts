import {NextRequest, NextResponse} from "next/server";
import { dbConnect } from "@/lib/db-connect";
import ScanEvent from "@/models/scan-event";
import { DateTime } from "luxon";

function getNZDateRange(dateStr: string) {
    // Convert the given date (YYYY-MM-DD) to start/end of the day in NZ time
    const startOfDayNZ = DateTime.fromISO(dateStr, { zone: "Pacific/Auckland" }).startOf("day");
    const endOfDayNZ = startOfDayNZ.plus({ days: 1 });

    // Convert both to UTC for database query
    return {
        $gte: startOfDayNZ.toUTC().toJSDate(),
        $lt: endOfDayNZ.toUTC().toJSDate(),
    };
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '25');
        const before = searchParams.get('before');
        const after = searchParams.get('after');
        const specificDate = searchParams.get('specificDate');
        const cardNumber = searchParams.get('cardNumber');
        const name = searchParams.get("name");
        const turnstile = searchParams.get("turnstile");

        // Calculate the number of items to skip based on the page
        const skip = (page - 1) * limit;

        // Set date query based on before and after
        const query: any = {};
        if (specificDate) {
            // query.time = { $gte: specificDate, $lt: new Date(specificDate).setDate(new Date(specificDate).getDate() + 1) };
            query.time = getNZDateRange(specificDate);
        } else {
            if (before) {
                query.time = { $lte: before };
            }
            if (after) {
                query.time = { ...query.time, $gte: after };
            }
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
            .sort({ time: -1 })
            .skip(skip)
            .limit(limit);

        // Count the total number of documents to calculate total pages
        const totalEvents = await ScanEvent.countDocuments(query);

        console.log("Fetched " + eventData.length + " events");

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