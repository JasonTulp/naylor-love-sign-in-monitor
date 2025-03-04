import fs from 'fs';
import csvParser from 'csv-parser';

interface Event {
    time: Date,
    firstNames: string,
    lastName: string,
    cardNumber: number
    cardTechnology: string,
    turnstile: number,
}

let timeColumn: string | null = null;
let eventColumn: string | null = null;
const csvPath = "resources/EOD_Report.csv";

async function parseCSV(csvPath: string): Promise<Event[]> {
    const events: Event[] = [];
    await new Promise<void>((resolve, reject) => {
        const parser = fs.createReadStream(csvPath).pipe(csvParser());
        parser
            .on('headers', (headers) => {
                console.log("CSV Headers Detected:", headers);

                // Find the best match for expected column names
                timeColumn = headers.find(h => h.toLowerCase().includes("time")) || null;
                eventColumn = headers.find(h => h.toLowerCase().includes("event")) || null;

                if (!timeColumn || !eventColumn) {
                    console.error("Error: Could not detect required columns (time/event).");
                    parser.destroy(); // Stop parsing if columns are missing
                    reject(new Error("Missing required columns in CSV"));
                }
            })
            .on('data', (row) => {
                const timeStr = row["Occurrence Time"];
                const eventStr = row["Event Full Description"]?.replace(/\r/g, "").trim(); // Remove carriage returns and trim spaces

                if (!timeStr || !eventStr) {
                    console.log("Skipping row due to missing data:", row);
                    return null;
                }

                // Parse time
                const time = new Date(timeStr);

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

                events.push({
                    time,
                    firstNames: fullFirstName,
                    lastName,
                    cardNumber,
                    cardTechnology,
                    turnstile,
                });
            })
            .on('end', resolve)
            .on('error', reject);
        return;
    });

    console.log("Parsed CSV file");
    console.log(events);
    return;
}
//
// console.log("Starting CSV parsing");
// parseCSV(csvPath).then(() => {
//     console.log("Finished parsing CSV");
// });
//
