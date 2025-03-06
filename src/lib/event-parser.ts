import ScanEvent from "@/models/scan-event"; // Import ScanEvent model if necessary
import { DateTime } from "luxon";

function convertToNZTime(timeStr: string) {
    // Parse the given format (M/D/YYYY h:mm:ss A)
    const parsedTime = DateTime.fromFormat(timeStr, "M/d/yyyy h:mm:ss a", { zone: "Pacific/Auckland" });
    // Convert to NZ time
    // const nzTime = parsedTime.setZone("Pacific/Auckland");
    return parsedTime.toJSDate(); // Return as a Date object
}

export function parseEvent(row: Record<string, string>): typeof ScanEvent | null {
    const timeStr = row["Occurrence Time"];
    const eventStr = row["Event Full Description"]?.replace(/\r/g, "").trim(); // Remove carriage returns and trim spaces

    if (!timeStr || !eventStr) {
        console.log("Skipping row due to missing data:", row);
        return null;
    }

    // Parse time
    const time = convertToNZTime(timeStr)
    console.log("Converting this time: ", timeStr, " to this time: ", time, );

    // Extract name using regex
    const nameMatch = eventStr.match(/^(.+?), (.+?) was granted entry/);
    if (!nameMatch) {
        console.log("Skipping row due to malformed name format:", eventStr);
        return null;
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
        time,
        name: fullFirstName + " " + lastName,
        cardNumber,
        cardTechnology,
        turnstile,
    };
}
