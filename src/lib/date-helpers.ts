import { DateTime } from "luxon";

export function getNZDateRange(dateStr: string) {
    // Convert the given date (YYYY-MM-DD) to start/end of the day in NZ time
    const startOfDayNZ = DateTime.fromISO(dateStr, { zone: "Pacific/Auckland" }).startOf("day");
    const endOfDayNZ = startOfDayNZ.plus({ days: 1 });

    console.log("startOfDayNZ: " + startOfDayNZ);
    console.log("endOfDayNZ: " + endOfDayNZ);

    // Convert both to UTC for database query
    return {
        $gte: startOfDayNZ.toUTC().toJSDate(),
        $lt: endOfDayNZ.toUTC().toJSDate(),
    };
} 