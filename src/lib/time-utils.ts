export interface TimeDifference {
    hours: number;
    minutes: number;
    isEstimated?: boolean;
}

/**
 * Calculates the time difference between two times, handling both actual and estimated cases
 * For estimated cases (no exit time), it will calculate until 6pm NZ time if current time is past 6pm
 */
export const calculateTimeDifference = (start: string, end: string | null): TimeDifference => {
    const startDate = new Date(start);

    if (!end) {
        // No exit time exists - check if we should estimate until 6pm
        const currentTime = new Date();
        const currentNZTime = new Date(currentTime.toLocaleString("en-US", { timeZone: "Pacific/Auckland" }));
        const startNZTime = new Date(startDate.toLocaleString("en-US", { timeZone: "Pacific/Auckland" }));
        const startSixPMNZTime = new Date(startNZTime.setHours(18, 0, 0, 0));

        if (currentNZTime > startSixPMNZTime) {
            const difference = startSixPMNZTime.getTime() - startDate.getTime();
            const hours = Math.floor(difference / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            return { hours, minutes, isEstimated: true };
        }
        return { hours: 0, minutes: 0, isEstimated: true };
    }

    // Get actual difference in hours and minutes
    const endDate = new Date(end);
    const difference = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes, isEstimated: false };
}; 