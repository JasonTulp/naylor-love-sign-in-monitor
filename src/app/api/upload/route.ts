import { NextRequest, NextResponse } from "next/server";
import csvParser from "csv-parser";
import { parseEvent } from "@/lib/event-parser";
import { dbConnect } from "@/lib/db-connect";
import ScanEvent from "@/models/scan-event";

export async function POST(req: NextRequest) {
    try {
        // Parse FormData
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

        await new Promise((resolve, reject) => {
            readableStream
                .pipe(csvParser())
                .on("data", (row: Record<string, string>) => {
                    const event = parseEvent(row);
                    if (event) events.push(event);
                })
                .on("end", resolve)  // Resolve when the parsing is done
                .on("error", reject); // Reject on error
        });

        // Connect to MongoDB
        await dbConnect();

        // Prepare the bulk write operations
        const bulkOps = events.map(event => ({
            updateOne: {
                filter: { _id: event._id }, // Find by unique identifier (_id)
                update: { $set: event }, // Set the fields to be updated
                upsert: true, // If the document doesn't exist, it will be inserted
            }
        }));

        // Perform the bulk operation
        if (bulkOps.length > 0) {
            const result = await ScanEvent.bulkWrite(bulkOps);
            console.log(`Processed ${result.upsertedCount} insertions and ${result.modifiedCount} updates.`);
        }

        // Return success response
        return NextResponse.json(
            { message: "File uploaded and events saved to database" },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
