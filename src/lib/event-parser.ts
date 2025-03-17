import ScanEvent2 from "@/models/scan-event-2"; // Import ScanEvent model if necessary
import { DateTime } from "luxon";

function convertToNZTime(timeStr: string) {
    // Parse the given format (M/D/YYYY h:mm:ss A)
    const parsedTime = DateTime.fromFormat(timeStr, "M/d/yyyy h:mm:ss a", { zone: "Pacific/Auckland" });
    // Convert to NZ time
    return parsedTime.toJSDate(); // Return as a Date object
}

export function parseEvent(row: Record<string, string>): typeof ScanEvent2 | null {
    const timeStr = row["Occurrence Time"];
    const eventStr = row["Event Full Description"]?.replace(/\r/g, "").trim(); // Remove carriage returns and trim spaces

    console.log("PARSING: " + timeStr + " " + eventStr);

    if (!timeStr || !eventStr) {
        console.log("Skipping row due to missing data:", row);
        return null;
    }

    // Parse time
    const time = convertToNZTime(timeStr);

    // Extract name using regex
    const nameMatchEntry = eventStr.match(/^(.+?), (.+?) was granted entry/);
    let nameMatch = null;
    let eventType: "entry" | "exit" = "entry";
    if (nameMatchEntry) {
        nameMatch = nameMatchEntry;
        eventType = "entry";
    } else {
        // Check if this is an exit event
        const nameMatchExit = eventStr.match(/^(.+?), (.+?) exited to/);
        if (!nameMatchExit) {
            // This was not an exit or an entry event, return
            console.log("Skipping row due to malformed name format:", eventStr);
            return null;
        }
        nameMatch = nameMatchExit;
        eventType = "exit";
    }

    const lastName = nameMatch[1]; // Last name
    const fullFirstName = nameMatch[2]; // First name(s)

    // Extract turnstile number
    const turnstileMatch = eventStr.match(/Turnstile (\d+)/);
    const turnstile = turnstileMatch ? parseInt(turnstileMatch[1], 10) : -1;

    // Extract card number
    const cardMatch = eventStr.match(/Card number \((\d+)\)/);
    const cardNumber = cardMatch ? parseInt(cardMatch[1], 10) : -1;

    // Extract card technology
    const cardTechMatch = eventStr.match(/Card Technology:\s*([^\n]+)/);
    const cardTechnology = cardTechMatch ? cardTechMatch[1].trim() : "Unknown";

    return {
        _id: `${Math.floor(time.getTime() / 1000)}-${cardNumber}`,
        entryTime: eventType === "entry" ? time : undefined,
        exitTime: eventType === "exit" ? time : undefined,
        name: fullFirstName + " " + lastName,
        cardNumber,
        cardTechnology,
        entryTurnstile: eventType === "entry" ? turnstile : undefined,
        exitTurnstile: eventType === "exit" ? turnstile : undefined,
        eventType,
    };
}
