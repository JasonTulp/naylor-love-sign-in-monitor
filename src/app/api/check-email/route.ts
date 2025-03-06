import { NextRequest, NextResponse } from "next/server";
// import { DateTime } from "luxon";
// import Imap from "imap-simple";
// import { Readable } from "stream";
// import FormData from "form-data";
//
// // Helper function to send CSV file to /api/upload
// async function uploadCSV(csvBuffer: Buffer) {
//     const form = new FormData();
//     form.append("file", csvBuffer, { filename: "attachment.csv", contentType: "text/csv" });
//
//     // Make the POST request to the /api/upload endpoint
//     const response = await fetch("http://localhost:3000/api/upload", {
//         method: "POST",
//         headers: {
//             "Content-Type": "multipart/form-data",
//         },
//         body: form,
//     });
//
//     const result = await response.json();
//     return result;
// }
//
export async function GET(req: NextRequest) {
    return NextResponse.json({
        success: true,
        message: `Processed emails`,
    });
    // try {
    //     // const authHeader = req.headers.get("authorization");
    //     // const API_SECRET = process.env.EMAIL_API_KEY;
    //     //
    //     // if (!API_SECRET) {
    //     //     return NextResponse.json({ error: "Server misconfiguration: Missing API key" }, { status: 500 });
    //     // }
    //     //
    //     // if (!authHeader || authHeader !== `Bearer ${API_SECRET}`) {
    //     //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    //     // }
    //     //
    //     // // Define IMAP configuration (for Gmail)
    //     // const config = {
    //     //     imap: {
    //     //         user: process.env.EMAIL_USER, // Gmail account
    //     //         password: process.env.EMAIL_PASSWORD, // App password
    //     //         host: "imap.gmail.com",
    //     //         port: 993,
    //     //         tls: true,
    //     //         authTimeout: 3000,
    //     //     },
    //     // };
    //     //
    //     // const connection = await Imap.connect(config);
    //     //
    //     // // Open inbox
    //     // await connection.openBox("INBOX");
    //     //
    //     // // Search for unseen emails
    //     // const searchCriteria = ["UNSEEN"];
    //     // const fetchOptions = {
    //     //     bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)", "TEXT", "BODY[]", "FLAGS"],
    //     //     markSeen: true,
    //     // };
    //     //
    //     // const messages = await connection.search(searchCriteria, fetchOptions);
    //     //
    //     // if (messages.length === 0) {
    //     //     return NextResponse.json({
    //     //         success: true,
    //     //         message: "No new emails to process.",
    //     //     });
    //     // }
    //     //
    //     // // Process each email and delete after processing
    //     // for (let message of messages) {
    //     //     const subject = message.parts[0].body.subject;
    //     //     const from = message.parts[0].body.from;
    //     //     const text = message.parts[1].body;
    //     //
    //     //     console.log(`Processing email: Subject - ${subject}, From - ${from}`);
    //     //     console.log("Body:", text);
    //     //
    //     //     // Check for attachments
    //     //     const attachments = message.parts.filter(part => part.disposition && part.disposition.type === "ATTACHMENT");
    //     //
    //     //     for (let attachment of attachments) {
    //     //         const filename = attachment.disposition.params.filename;
    //     //         const mimeType = attachment.type;
    //     //
    //     //         // Check if the file is a CSV (either by mime type or extension)
    //     //         if (filename && mimeType === "text/csv" || filename.endsWith(".csv")) {
    //     //             const csvBuffer = Buffer.from(attachment.body);
    //     //
    //     //             // Call the /api/upload route with the CSV file
    //     //             const uploadResult = await uploadCSV(csvBuffer);
    //     //             console.log("Upload result:", uploadResult);
    //     //         }
    //     //     }
    //     //
    //     //     // Mark email as processed (delete after processing)
    //     //     await connection.addFlags(message.attributes.uid, ["\\Deleted"]);
    //     // }
    //     //
    //     // // Expunge to permanently delete marked messages
    //     // await connection.expunge();
    //     //
    //     // // Close the connection
    //     // connection.end();
    //
    //     return NextResponse.json({
    //         success: true,
    //         message: `Processed emails`,
    //     });
    // } catch (error) {
    //     return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    // }
}
