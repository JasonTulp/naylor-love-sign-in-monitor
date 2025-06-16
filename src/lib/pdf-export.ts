import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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

const formatDateShort = (date: Date): string => {
    const formattedDate = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "Pacific/Auckland", // NZ time
    }).format(date);

    return formattedDate.replace(",", ""); // Remove any comma
}

// Helper to fetch image as data URL
const fetchImageAsDataURL = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const exportEventsToPDF = async (options: ExportOptions): Promise<void> => {
    try {
        // Fetch logo as data URL
        const logoDataUrl = await fetchImageAsDataURL('/Naylor-Love-hover-logo-2.png');
        // Get all data without pagination
        const queryParams: Record<string, string> = {
            limit: '999999', // Large number to get all records
        };

        // Add all non-undefined options to query params
        Object.entries(options).forEach(([key, value]) => {
            if (value !== undefined) {
                if (key === 'beforeDate' || key === 'afterDate' || key === 'specificDate') {
                    if (value) {
                        queryParams[key] = new Date(value).toISOString();
                    }
                } else {
                    queryParams[key] = String(value);
                }
            }
        });
        console.log(queryParams);

        const response = await fetch(`/api/scan-events?${new URLSearchParams(queryParams)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const events: ScanEvent[] = data.data;

        // Create PDF document
        const doc = new jsPDF();
        // Add logo to top right
        const pageWidth = doc.internal.pageSize.getWidth();
        const logoWidth = 50;
        const logoHeight = 15.5; // Adjust as needed for aspect ratio
        doc.addImage(logoDataUrl, 'PNG', pageWidth - logoWidth - 14, 8, logoWidth, logoHeight);
        // Add title
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('F&P Turnstile Sign-In Report', 14, 24);
        // Add horizontal line under title
        doc.setDrawColor(0, 0, 0); // Match the table header color
        doc.line(14, 28, pageWidth - 14, 28); // Draw line from left margin to right margin
        doc.setFont('helvetica', 'normal');
        
        
        // Add date range if specified
        doc.setFontSize(10);
        let yPos = 34;
        const xOffset = 5;

        if (options.name) {
            doc.text(`${options.name}`, 14 + xOffset, yPos);
            yPos += 5;
        }
        if (options.cardNumber) {
            doc.text(`Card Number: ${options.cardNumber}`, 14 + xOffset, yPos);
            yPos += 5;
        }
        let dateString = "";
        if (options.afterDate && options.beforeDate && options.afterDate === options.beforeDate) {
            dateString = formatDateShort(new Date(options.afterDate));
            doc.text(`Date: ${dateString}`, 14 + xOffset, yPos);
            yPos += 5;
        } else if (options.afterDate || options.beforeDate) {
            let beforeDateString;
            let afterDateString;
            if (options.beforeDate) {
                beforeDateString = formatDateShort(new Date(options.beforeDate));
                doc.text(`From: ${beforeDateString}`, 14 + xOffset, yPos);
                yPos += 5;
            }
            if (options.afterDate) {
                afterDateString = formatDateShort(new Date(options.afterDate));
                doc.text(`To: ${afterDateString}`, 14 + xOffset, yPos);
                yPos += 5;
            }

            if (beforeDateString && afterDateString) {
                dateString = `${beforeDateString}-${afterDateString}`;
            } else if (beforeDateString) {
                dateString = `before-${beforeDateString}`;
            } else if (afterDateString) {
                dateString = `after-${afterDateString}`;
            }
        }
        console.log("Date string: " + dateString);


        let totalTimeOnSite = 0;

        // Prepare table data
        const tableData = events.map(event => {
            const entryTime = new Date(event.entryTime);
            const { hours, minutes } = calculateTimeDifference(event.entryTime, event.exitTime);
            totalTimeOnSite += hours * 60 + minutes;
            
            return [
                event.name,
                event.cardNumber,
                formatDateLong(entryTime),
                event.entryTurnstile,
                event.exitTime ? formatDateLong(new Date(event.exitTime)) : 'N/A',
                event.exitTurnstile || 'N/A',
                `${hours}:${minutes}`
            ];
        });

        doc.text(`Total Time on Site: ${Math.floor(totalTimeOnSite / 60)} hr ${totalTimeOnSite % 60 }min`, 14 + xOffset, yPos);
        yPos += 7;

        // Add table using autoTable
        autoTable(doc, {
            startY: yPos,
            head: [['Name', 'Card Number', 'Entry Time', 'Entry Turnstile', 'Exit Time', 'Exit Turnstile', 'Time on Site']],
            body: tableData,
            theme: 'grid',
            styles: {
                fontSize: 8,
                cellPadding: 2,
            },
            headStyles: {
                fillColor: [18, 187, 187],
                textColor: 255,
                fontSize: 9,
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245],
            },
            margin: { top: 10 },
            columnStyles: {
                0: { cellWidth: 25 }, // Name
                2: { cellWidth: 45 }, // Entry Time
                4: { cellWidth: 45 }, // Exit Time
            },
            // didDrawPage: function (data) {
            //     // Add page number at bottom right with placeholder for total
            //     const pageSize = doc.internal.pageSize;
            //     const pageHeight = pageSize.getHeight();
            //     const pageWidth = pageSize.getWidth();
            //     const pageCurrent = doc.getCurrentPageInfo().pageNumber;
            //     doc.setFontSize(8);
            //     doc.text(`Page ${pageCurrent} of {totalPages}`, pageWidth - 20, pageHeight - 8, { align: 'right' });
            // },
        });

        // Replace placeholder with actual total page count
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            const pageSize = doc.internal.pageSize;
            const pageHeight = pageSize.getHeight();
            const pageWidth = pageSize.getWidth();
            doc.setFontSize(8);
            doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 8, { align: 'right' });
        }

        // Save the PDF
        const date = new Date().toISOString().split('T')[0];
        let name = options.name || options.cardNumber || "all";
        name = name.replace(/ /g, "-");
        name = name.toLowerCase();
        dateString = dateString.replace(/\//g, ".");
        console.log("Date string: " + dateString);

        doc.save(`nl-fnp-turnstile-export-${name}-${dateString}.pdf`);

    } catch (error) {
        console.error('Error exporting PDF:', error);
        throw new Error('Failed to export PDF. Please try again.');
    }
}; 