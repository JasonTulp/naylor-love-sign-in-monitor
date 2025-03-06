import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        // Mailgun sends email data as form-data
        const emailData = {
            from: formData.get("From"),
            to: formData.get("To"),
            subject: formData.get("Subject"),
            body: formData.get("body-plain") || formData.get("body-html"),
        };

        // Log the email data for inspection
        console.log(emailData);

        return NextResponse.json({ success: true, message: "Email received" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}