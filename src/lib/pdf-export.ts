import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    specificDate?: string;
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

const calculateTimeOnSite = (entryTime: string, exitTime: string | null): { hours: number; minutes: number } => {
    const entry = new Date(entryTime);
    const exit = exitTime ? new Date(exitTime) : null;
    
    if (!exit) {
        return { hours: 0, minutes: 0 };
    }

    const diffMs = exit.getTime() - entry.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes };
};

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
        doc.text('F&P Turnstile Sign-In Report', 14, 15);
        doc.setFont('helvetica', 'normal');
        
        // Add date range if specified
        doc.setFontSize(10);
        let yPos = 25;
        if (options.specificDate) {
            doc.text(`Date: ${new Date(options.specificDate).toLocaleDateString()}`, 14, yPos);
            yPos += 7;
        } else if (options.afterDate || options.beforeDate) {
            if (options.afterDate) {
                doc.text(`From: ${new Date(options.afterDate).toLocaleDateString()}`, 14, yPos);
                yPos += 7;
            }
            if (options.beforeDate) {
                doc.text(`To: ${new Date(options.beforeDate).toLocaleDateString()}`, 14, yPos);
                yPos += 7;
            }
        }

        if (options.name) {
            doc.text(`${options.name}`, 14, yPos);
            yPos += 7;
        }
        if (options.cardNumber) {
            doc.text(`Card Number: ${options.cardNumber}`, 14, yPos);
            yPos += 7;
        }


        // Prepare table data
        const tableData = events.map(event => {
            const entryTime = new Date(event.entryTime);
            const { hours, minutes } = calculateTimeOnSite(event.entryTime, event.exitTime);
            
            return [
                event.name,
                event.cardNumber,
                formatDateLong(entryTime),
                event.entryTurnstile,
                event.exitTime ? formatDateLong(new Date(event.exitTime)) : 'N/A',
                event.exitTurnstile || 'N/A',
                `${hours}hr ${minutes}min`
            ];
        });

        // Add table using autoTable
        autoTable(doc, {
            startY: yPos + 5,
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
        doc.save(`nl-fnp-turnstile-export-${date}.pdf`);

    } catch (error) {
        console.error('Error exporting PDF:', error);
        throw new Error('Failed to export PDF. Please try again.');
    }
}; 