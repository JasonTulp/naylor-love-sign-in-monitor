import { calculateTimeDifference } from "./time-utils";

interface ScanEvent {
    name: string;
    cardNumber: string;
    entryTime: string;
    entryTurnstile: string;
    exitTime: string | null;
    exitTurnstile: string | null;
}

interface ExportOptions {
    beforeDate?: string;
    afterDate?: string;
    cardNumber?: string;
    name?: string;
    turnstile?: string;
    isUnique?: boolean;
    hasSignedOut?: "yes" | "no" | "either";
    sortBy?: "entryTime" | "exitTime" | "cardNumber" | "name";
    sortOrder?: "asc" | "desc";
}

const formatDateLong = (date: Date): string => {
    const formattedDate = new Intl.DateTimeFormat("en-GB", {
        weekday: "short",  // "Mon"
        day: "2-digit",    // "23"
        month: "2-digit",  // "04"
        year: "numeric",   // "2024"
        hour: "2-digit",   // "12"
        minute: "2-digit", // "13"
        second: "2-digit", // "10"
        hour12: true,      // 12-hour format with AM/PM
        timeZone: "Pacific/Auckland", // NZ time
    }).format(date);

    return formattedDate.replace(",", ""); // Remove any comma
};

const convertEventsToCSV = (events: ScanEvent[]): string => {
    const headers = [
        'Name',
        'Card Number',
        'Entry Time',
        'Entry Turnstile',
        'Exit Time',
        'Exit Turnstile',
        'Time on Site (hours)',
        'Time on Site (minutes)'
    ];

    const csvRows = events.map(event => {
        const entryTime = new Date(event.entryTime);
        const { hours, minutes } = calculateTimeDifference(event.entryTime, event.exitTime);

        // Only wrap date fields in quotes since they contain commas
        const row = [
            event.name,
            event.cardNumber,
            `"${formatDateLong(entryTime)}"`,
            event.entryTurnstile,
            event.exitTime ? `"${formatDateLong(new Date(event.exitTime))}"` : 'N/A',
            event.exitTurnstile || 'N/A',
            hours.toString(),
            minutes.toString()
        ];

        return row.join(',');
    });

    return [
        headers.join(','),
        ...csvRows
    ].join('\n');
};

const downloadCSV = (csvContent: string): void => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const date = new Date().toISOString().split('T')[0];
    const filename = `nl-fnp-trunstile-export-${date}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportEventsToCSV = async (options: ExportOptions): Promise<void> => {
    try {
        // Get all data without pagination
        const queryParams: Record<string, string> = {
            limit: '999999', // Large number to get all records
        };

        // Add all non-undefined options to query params
        Object.entries(options).forEach(([key, value]) => {
            if (value !== undefined) {
                if (key === 'beforeDate' || key === 'afterDate') {
                    if (value) {
                        queryParams[key] = new Date(value).toISOString();
                    }
                } else {
                    queryParams[key] = String(value);
                }
            }
        });

        const response = await fetch(`/api/scan-events?${new URLSearchParams(queryParams)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const csvContent = convertEventsToCSV(data.data);
        downloadCSV(csvContent);
    } catch (error) {
        console.error('Error exporting CSV:', error);
        throw new Error('Failed to export CSV. Please try again.');
    }
}; 