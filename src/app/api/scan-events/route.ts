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
        const isUnique = searchParams.get("isUnique") === "true";

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
        let eventData;
        let totalEvents;
        let totalPages;
        console.log("unique? " + isUnique + " specificDate? " + specificDate);

        if (isUnique && specificDate) {
            console.log("Fetching unique events for " + specificDate);
            const rawData = await ScanEvent.find(query)
                .sort({ time: -1 });
            // Filter out duplicates based on `cardNumber` and get the latest
            const seenCardNumbers = new Set();
            eventData = rawData.filter((item) => {
                if (seenCardNumbers.has(item.cardNumber)) {
                    return false;  // Skip if the cardNumber has already been seen
                }
                seenCardNumbers.add(item.cardNumber);
                return true;
            });
            totalEvents = eventData.length;
            totalPages = 1;
        } else {
            console.log("Fetching all events for " + specificDate);
            eventData = await ScanEvent.find(query)
                .sort({ time: -1 })
                .skip(skip)
                .limit(limit);
            totalEvents = await ScanEvent.countDocuments(query);
            totalPages = Math.ceil(totalEvents / limit);
        }

        // Count the total number of documents to calculate total pages

        console.log("Fetched " + eventData.length + " events");

        return NextResponse.json({
            success: true,
            data: eventData,
            totalEvents,
            totalPages: totalPages,
            currentPage: page,
        });
    } catch (error) {
        // @ts-ignore
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}