import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        // Extract the basic email data
        const emailData = {
            from: formData.get("From"),
            to: formData.get("To"),
            subject: formData.get("Subject"),
            body: formData.get("body-plain") || formData.get("body-html"),
        };

        // Log the email data for inspection
        console.log(emailData);

        // Check for file attachments
        const attachments: File[] = [];
        for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
                // Check if the file is a CSV by looking at its MIME type
                if (value.type === 'text/csv') {
                    console.log("CSV FILE FOUND");
                    attachments.push(value);
                }
            }
        }
        console.log("Found attachments: ", attachments.length, " CSV file(s)");

        if (attachments.length > 0) {
            // Call the /api/upload with the CSV file(s)
            for (const attachment of attachments) {
                // Create FormData to send to the upload API
                const uploadFormData = new FormData();
                uploadFormData.append("file", attachment);

                console.log("Attempting to upload attachment " + attachment.name);
                // Send the file to your /api/upload endpoint
                const uploadResponse = await fetch(`${window.location.origin}/api/upload`, {
                    method: "POST",
                    body: uploadFormData,
                });

                if (!uploadResponse.ok) {
                    throw new Error("Failed to upload CSV file.");
                }

                const uploadResult = await uploadResponse.json();
                console.log(uploadResult);  // Log the upload result
            }
        } else {
            console.log("No CSV file attached.");
        }

        return NextResponse.json({ success: true, message: "Email received" });
    } catch (error: any) {
        console.error("Error in upload API:", error);
        return NextResponse.json({ message: "Error uploading files: " + error.message }, { status: 500 });
    }
}
