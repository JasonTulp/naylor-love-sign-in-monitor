import { DateTime } from "luxon";

export function getNZDateRange(dateStr: string) {
    // Convert the given date (YYYY-MM-DD) to start/end of the day in NZ time
    const startOfDayNZ = DateTime.fromISO(dateStr, { zone: "Pacific/Auckland" }).startOf("day");
    const endOfDayNZ = startOfDayNZ.plus({ days: 1 });

    console.log("startOfDayNZ: " + startOfDayNZ.toUTC().toJSDate());
    console.log("endOfDayNZ: " + endOfDayNZ.toUTC().toJSDate());

    // Convert both to UTC for database query
    return {
        $gte: startOfDayNZ.toUTC().toJSDate(),
        $lt: endOfDayNZ.toUTC().toJSDate(),
    };
} 

export function getNZDateRangeForStartAndEnd(startDate: string, endDate: string) {
    // Convert the given date (YYYY-MM-DD) to start/end of the day in NZ time
    const startOfDayNZ = DateTime.fromISO(startDate, { zone: "Pacific/Auckland" }).startOf("day");
    const endOfDayNZ = DateTime.fromISO(endDate, { zone: "Pacific/Auckland" }).endOf("day");

    console.log("startOfDayNZ: " + startOfDayNZ.toUTC().toJSDate());
    console.log("endOfDayNZ: " + endOfDayNZ.toUTC().toJSDate());

    // Convert both to UTC for database query
    return {
        $gte: startOfDayNZ.toUTC().toJSDate(),
        $lt: endOfDayNZ.toUTC().toJSDate(),
    };
} 

export function getNZDateRangeForStart(startDate: string) {
    // Convert the given date (YYYY-MM-DD) to start/end of the day in NZ time
    const startOfDayNZ = DateTime.fromISO(startDate, { zone: "Pacific/Auckland" }).startOf("day");

    console.log("startOfDayNZ: " + startOfDayNZ.toUTC().toJSDate());

    // Convert both to UTC for database query
    return {
        $gte: startOfDayNZ.toUTC().toJSDate(),
    };
} 

export function getNZDateRangeForEnd(endDate: string) {
    // Convert the given date (YYYY-MM-DD) to start/end of the day in NZ time
    const endOfDayNZ = DateTime.fromISO(endDate, { zone: "Pacific/Auckland" }).endOf("day");

    console.log("endOfDayNZ: " + endOfDayNZ.toUTC().toJSDate());

    // Convert both to UTC for database query
    return {
        $lt: endOfDayNZ.toUTC().toJSDate(),
    };
} 