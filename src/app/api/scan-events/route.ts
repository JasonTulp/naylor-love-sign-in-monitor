import {NextRequest, NextResponse} from "next/server";
import { dbConnect } from "@/lib/db-connect";
import ScanEvent2 from "@/models/scan-event-2";
import { getNZDateRange } from "@/lib/date-helpers";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '100');
        const before = searchParams.get('before');
        const after = searchParams.get('after');
        const specificDate = searchParams.get('specificDate');
        const cardNumber = searchParams.get('cardNumber');
        const name = searchParams.get("name");
        const turnstile = searchParams.get("turnstile");
        const isUnique = searchParams.get("isUnique") === "true";
        const hasSignedOut = searchParams.get("hasSignedOut");
        const sortBy = searchParams.get("sortBy");
        const sortOrder = searchParams.get("sortOrder");

        // Calculate the number of items to skip based on the page
        const skip = (page - 1) * limit;

        // Set date query based on before and after
        const query: any = {};
        if (specificDate) {
            // query.time = { $gte: specificDate, $lt: new Date(specificDate).setDate(new Date(specificDate).getDate() + 1) };
            query.entryTime = getNZDateRange(specificDate);
        } else {
            if (before) {
                query.entryTime = { $lte: before };
            }
            if (after) {
                query.entryTime = { ...query.entryTime, $gte: after };
            }
        }
        if (cardNumber) {
            query.cardNumber = cardNumber;
        }

        // Apply name search (case-insensitive)
        if (name) {
            query.name = { $regex: name, $options: "i" };
        }
        // Apply turnstile search
        if (turnstile) {
            // convert to number
            query.entryTurnstile = parseInt(turnstile);
        }

        if (hasSignedOut) {
            if (hasSignedOut === "yes") {
                query.exitTime = { $exists: true };
            } else if (hasSignedOut === "no") {
                query.exitTime = { $exists: false };
            }
        }


        await dbConnect();

        // Fetch the paginated data
        let eventData;
        let totalEvents;
        let totalPages;

        if (isUnique && specificDate) {
            console.log("Fetching unique events for " + specificDate);
            const rawData = await ScanEvent2.find(query)
                .sort({ [sortBy?? "entryTime"]: sortOrder === "asc" ? 1 : -1 });
            // Filter out duplicates based on `cardNumber` and get the latest
            const seenCardNumbers = new Set();
            eventData = rawData.filter((item: any) => {
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
            eventData = await ScanEvent2.find(query)
                .sort({ [sortBy?? "entryTime"]: sortOrder === "asc" ? 1 : -1 })
                .skip(skip)
                .limit(limit);
            totalEvents = await ScanEvent2.countDocuments(query);
            totalPages = Math.ceil(totalEvents / limit);
        }

        // Count the total number of documents to calculate total pages

        console.log("Fetched " + eventData.length + " events");
        // console.log(eventData);

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