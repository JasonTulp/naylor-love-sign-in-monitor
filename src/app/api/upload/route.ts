import { NextRequest, NextResponse } from "next/server";
import csvParser from "csv-parser";
import { parseEvent } from "@/lib/event-parser";
import { dbConnect } from "@/lib/db-connect";
import ScanEvent2 from "@/models/scan-event-2";
import { pipeline } from 'stream/promises';
import { getNZDateRange } from "@/lib/date-helpers";
import { DateTime } from "luxon";

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes in seconds

export async function POST(req: NextRequest) {
    try {
        // Ensure it's multipart/form-data before proceeding
        if (req.headers.get('content-type')?.includes('multipart/form-data')) {
            const formData = await req.formData();
            const file = formData.get("file") as File;

            if (!file) {
                return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
            }


            // Read the file buffer
            const buffer = Buffer.from(await file.arrayBuffer());
            const events: any[] = [];

            const stream = require("stream");
            const readableStream = new stream.PassThrough();
            readableStream.end(buffer);
            let uploadedCount = 0;
            
            await new Promise((resolve, reject) => {
                readableStream
                    .pipe(csvParser())
                    .on("data", async (row: Record<string, string>) => {
                        const event = parseEvent(row);
                        if (event) {
                            events.push(event);
                        }
                    })
                    .on("end", resolve)  // Resolve when the parsing is done
                    .on("error", reject); // Reject on error
            });

            // Connect to MongoDB
            await dbConnect();
            for (const event of events) {
                if (event.eventType === "entry") {
                    try {
                        // TODO do we want to search for exit events too? Or just assume events come in order?
                        await ScanEvent2.updateOne({ _id: event._id }, { $set: event }, { upsert: true });
                        uploadedCount++;
                        console.log(`Added entry event: ${event.entryTime} cardNo.: ${event.cardNumber} name: ${event.name}`);
                    } catch (error: any) {
                        console.log(`Error adding entry event: ${event.entryTime} cardNo.: ${event.cardNumber} name: ${event.name}`);
                        console.log(error);
                    }
                } else {
                    // find entry event from mongoDB by filtering by date, card number and events without exit time
                    const query: any = {};
                    const time = DateTime.fromJSDate(event.exitTime);
                    const startOfDay = time.startOf("day");
                    console.log(`Searching for entry event for exit event: ${event.exitTime} cardNo.: ${event.cardNumber} name: ${event.name}`);
                    console.log("startOfDay: " + startOfDay.toUTC().toJSDate());
                    console.log("time: " + time.toUTC().toJSDate());
                    console.log("\n");
                    // const endOfDay = startOfDay.plus({ days: 1 });
                    // query.entryTime = {
                    //     $gte: startOfDay.toUTC().toJSDate(),
                    //     $lt: time.toUTC().toJSDate(),
                    // };
                    // query.cardNumber = event.cardNumber;
                    // query.exitTime = { $exists: false };
                    // try {
                    //     const result = await ScanEvent2.updateOne(
                    //         query, 
                    //         { 
                    //             $set: {
                    //                 exitTime: event.exitTime,
                    //                 exitTurnstile: event.exitTurnstile,
                    //             }
                    //         }
                    //     );
                    //     if (result.modifiedCount > 0) {
                    //         uploadedCount++;
                    //         console.log(`Updated entry event with exit time: ${event.exitTime} cardNo.: ${event.cardNumber} name: ${event.name}`);
                    //     }
                    //     else {
                    //         console.log(`No entry event found for exit event: ${event.exitTime} cardNo.: ${event.cardNumber} name: ${event.name} .... Skipping`);
                    //     }
                    // }catch (error: any) {
                    //     console.log(`Error adding exit event: ${event.entryTime} cardNo.: ${event.cardNumber}`);
                    //     console.log(error);
                    // }
                }
            }

            let message = uploadedCount === 0 ? "No new files uploaded" : `${uploadedCount} files uploaded. Refresh the page to view them`;
            return NextResponse.json({ message }, { status: 200 });
        } else {
            return NextResponse.json({ message: "Invalid content type" }, { status: 400 });
        }

    } catch (error: any) {
        console.error("Error in upload API:", error);
        return NextResponse.json({ message: "Error uploading files: " + error.message }, { status: 500 });
    }
}
