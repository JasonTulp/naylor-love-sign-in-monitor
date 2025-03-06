import ScanEvent from "@/models/scan-event"; // Import ScanEvent model if necessary

export function parseEvent(row: Record<string, string>): typeof ScanEvent | null {
    const timeStr = row["Occurrence Time"];
    const eventStr = row["Event Full Description"]?.replace(/\r/g, "").trim(); // Remove carriage returns and trim spaces

    if (!timeStr || !eventStr) {
        console.log("Skipping row due to missing data:", row);
        return null;
    }

    // Parse time
    const time = new Date(timeStr)
    const localTime = new Date(time.toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' }));
    console.log("Converting this time: ", timeStr, " to this time: ", localTime, );

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
        _id: `${Math.floor(localTime.getTime() / 1000)}-${cardNumber}`,
        time: localTime,
        name: fullFirstName + " " + lastName,
        cardNumber,
        cardTechnology,
        turnstile,
    };
}
