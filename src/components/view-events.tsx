import {useEffect, useState} from "react";
import Spinner from "@/components/spinner";
import HorizontalRule from "@/components/horizontal-rule";
import { exportEventsToCSV } from "@/lib/csv-export";
import { exportEventsToPDF } from "@/lib/pdf-export";
import { calculateTimeDifference } from "@/lib/time-utils";

export default function ViewEvents() {
    const [events, setEvents] = useState<any[]>([]);
    const [expandedIndex, setExpandedIndex] = useState(-1);
    const [hoverIndex, setHoverIndex] = useState(-1);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalEvents, setTotalEvents] = useState(1);
    const [loading, setLoading] = useState(true);
    const [beforeDate, setBeforeDate] = useState<string>("");
    const [afterDate, setAfterDate] = useState<string>("");
    const [specificDate, setSpecificDate] = useState<string>("");
    const [cardNumber, setCardNumber] = useState<string>("");
    const [turnstile, setTurnstile] = useState<string>("");
    const [isUnique, setIsUnique] = useState<boolean>(false);
    const [hasSignedOut, setHasSignedOut] = useState<"yes" | "no" | "either">("either");
    const [sortBy, setSortBy] = useState<"entryTime" | "exitTime" | "cardNumber" | "name">("entryTime");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [name, setName] = useState<string>("");
    const [setFilters, setSetFilters] = useState(false);

    const fetchEvents = async (page: number) => {
        try {
            const queryParams: any = {
                page: currentPage,
                limit: 50,
            };
            if (beforeDate) queryParams.beforeDate = new Date(beforeDate).toISOString();
            if (afterDate) queryParams.afterDate = new Date(afterDate).toISOString();
            // if (specificDate) queryParams.specificDate = new Date(specificDate).toISOString();
            if (cardNumber) queryParams.cardNumber = cardNumber;
            if (name) queryParams.name = name;
            if (turnstile) queryParams.turnstile = turnstile;
            if (isUnique) queryParams.isUnique = isUnique ? "true" : "false";
            if (hasSignedOut !== "either") queryParams.hasSignedOut = hasSignedOut;
            if (sortBy) queryParams.sortBy = sortBy;
            if (sortOrder) queryParams.sortOrder = sortOrder;

            const response = await fetch(`/api/scan-events?${new URLSearchParams(queryParams)}`);
            const data = await response.json();
            setEvents(data.data);
            setTotalPages(data.totalPages);
            setTotalEvents(data.totalEvents);
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        setLoading(true);
        setExpandedIndex(-1);
        setCurrentPage(1);
        fetchEvents(currentPage).then(() =>
            setLoading(false)
        );
    };

    const clearFilters = () => {
        setBeforeDate("");
        setAfterDate("");
        setSpecificDate("");
        setCardNumber("");
        setName("");
        setTurnstile("");
        setIsUnique(false);
        setHasSignedOut("either");
        setCurrentPage(1);
        setSetFilters(true);
    };

    // Run applyFilters *only* after state updates
    useEffect(() => {
        if (setFilters) {
            applyFilters();
            setSetFilters(false);
        }
    }, [setFilters]);


    // Run applyFilters *only* after state updates
    useEffect(() => {
        if (specificDate !== "") {
            applyFilters();
        }
    }, [specificDate, isUnique]);


    // Use effect is called when the component is mounted
    useEffect(() => {
        setLoading(true);
        setExpandedIndex(-1);
        fetchEvents(currentPage).then(() =>
            setLoading(false)
        );
    }, [currentPage]);

    const formatDateLong = (date: Date) => {
        const formattedDate = new Intl.DateTimeFormat("en-GB", {
            weekday: "short",  // "Mon"
            day: "2-digit",    // "23"
            month: "2-digit",  // "04"
            year: "numeric",   // "2024"
            hour: "2-digit",   // "12"
            minute: "2-digit", // "13"
            second: "2-digit", // "10"
            hour12: true,       // 12-hour format with AM/PM
            timeZone: "Pacific/Auckland", // NZ time
        }).format(date);

        const displayDate = formattedDate.replace(",", ""); // To remove any comma
        return displayDate;
    }

    const formatDateShort = (date: Date) => {
        const formattedDate = new Intl.DateTimeFormat("en-GB", {
            hour: "2-digit",   // "12"
            minute: "2-digit", // "13"
            second: "2-digit", // "10"
            hour12: true,       // 12-hour format with AM/PM
            timeZone: "Pacific/Auckland", // NZ time
        }).format(date);

        const displayDate = formattedDate.replace(",", ""); // To remove any comma
        return displayDate;
    }


    const getTimeDifference = (end: string | null, start: string) => {
        const { hours, minutes, isEstimated } = calculateTimeDifference(start, end);
        
        if (isEstimated) {
            if (hours === 0 && minutes === 0) {
                return <p className="font-bold">Still on site</p>;
            }
            return <p className="font-bold">Time on site: {hours}hr {minutes}min (estimated)</p>;
        }
        
        return <p className="font-bold">Time on site: {hours}hr {minutes}min</p>;
    }

    const getExitTurnstile = (exitTurnstile: string | null) => {
        if (!exitTurnstile) {
            return (
                <p className="font-bold">Exit turnstile: N/A</p>
            )
        }
        return (
            <p className="font-bold">Exit turnstile: {exitTurnstile}</p>
        )
    }

    const getTimeString = (entry: string, exit: string | null) => {
        const entryDate = new Date(entry);
        const entryTime = formatDateLong(entryDate);

        // An exit time exists and is greater than the entry time
        if (exit) {
            const exitDate = new Date(exit);
            const exitTime = formatDateShort(exitDate);
            if (entryDate.getTime() <= exitDate.getTime()) {
                return (`${entryTime} - ${exitTime}`);
            }
        }

        // No exit time exists
        // Check if the current time is greater than 6.00pm NZTime
        const currentTime = new Date();
        const currentNZTime = new Date(currentTime.toLocaleString("en-US", { timeZone: "Pacific/Auckland" }));
        const sixPMNZTime = new Date(entryDate.setHours(18, 0, 0, 0));
        if (currentNZTime > sixPMNZTime) {
            return (
                <span>
                    {entryTime} - <span className="text-amber-500">6:00:00 pm</span>
                </span>
            );
        }

        return entryTime;
    }

    const handleCSVExport = async () => {
        try {
            setLoading(true);
            await exportEventsToCSV({
                beforeDate,
                afterDate,
                cardNumber,
                name,
                turnstile,
                isUnique,
                hasSignedOut,
                sortBy,
                sortOrder
            });
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to export CSV. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePDFExport = async () => {
        try {
            setLoading(true);
            await exportEventsToPDF({
                beforeDate,
                afterDate,
                cardNumber,
                name,
                turnstile,
                isUnique,
                hasSignedOut,
                sortBy,
                sortOrder
            });
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to export PDF. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    let eventData;
    if (!loading && events && events.length) {
        eventData = <div className="space-y-2 pt-4 w-full mx-auto">
            {events.map((event, index) => (
                <div
                    key={index}
                    className={`relative bg-mid-light  pt-8 pb-10 rounded-md shadow-md shadow-dark cursor-pointer transition-all duration-300
                    ${expandedIndex === index ? 'ring-2 ring-primary' : ''}
                    ${hoverIndex === index && expandedIndex !== index ? 'ring-1 ring-light-as' : ''}
                `}
                    onClick={() =>
                        setExpandedIndex(expandedIndex === index ? -1 : index)
                    }
                    onMouseEnter={() => setHoverIndex(index)}
                    onMouseLeave={() => setHoverIndex(-1)}
                >
                    {/* Top Left: Name */}
                    <span
                        className="absolute top-2 left-5 text-xl font-bold capitalize transition-colors duration-200 hover:text-primary"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevents expanding the card
                            setName(event.name);
                            setSetFilters(true);
                        }}
                        >
                        {event.name}
                    </span>

                    {/* Top Right: cardNumber */}
                    <span
                        className="absolute top-2 right-5 text-2xl font-bold transition-colors duration-200 hover:text-primary"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevents expanding the card
                            setCardNumber(event.cardNumber);
                            setSetFilters(true);
                        }}
                    >
                        {event.cardNumber}
                    </span>

                    {/* Bottom Left: Time/ Date */}
                    <span className="absolute bottom-2 left-5 text-sm md:text-md text-primary">
                    { getTimeString(event.entryTime, event.exitTime)}
                    </span>
                    {/* Expanded Section */}
                    {expandedIndex === index && (
                        <div className="mt-2 text-sm bg-mid p-4 w-100">
                            <p className="font-bold">Card Tech: {event.cardTechnology}</p>
                            <p className="font-bold">{"Entry turnstile: " + event.entryTurnstile}</p>
                            {getExitTurnstile(event.exitTurnstile)}
                            {getTimeDifference(event.exitTime, event.entryTime)}
                        </div>
                    )}
                </div>
            ))}
        </div>
    } else {
        if (totalPages === 0) {
            eventData = <h2 className={"mt-4 p-2 rounded-md text-center font-extrabold !bg-red-200 !text-red-900"}>No event data available</h2>
        } else {
            eventData = <h2 className={"mt-4 p-2 rounded-md text-center font-extrabold !bg-red-200 !text-red-900"}>No event data within specified filters</h2>
        }
    }

    return (
        <div className="w-full" >
            <div className={"p-0"}>
                {/* Date Filter Section */}
                <div className="grid grid-cols-2 sm:grid-cols-4  gap-x-2 gap-y-1 py-2 w-full">
                    <div className="flex flex-col">
                        <label htmlFor="beforeDate" className="block">Start Date</label>
                        <input
                            type="date"
                            id="beforeDate"
                            value={beforeDate}
                            onChange={(e) => {
                                const newBeforeDate = e.target.value;
                                setBeforeDate(newBeforeDate);
                                // If afterDate is not set or is less than/equal to new beforeDate, update it
                                if (!afterDate || new Date(afterDate) <= new Date(newBeforeDate)) {
                                    setAfterDate(newBeforeDate);
                                }
                                setSetFilters(true);
                            }}
                            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                            className="input h-8 w-full"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="afterDate" className="block">End Date</label>
                        <input
                            type="date"
                            id="afterDate"
                            value={afterDate}
                            onChange={(e) => {
                                const newAfterDate = e.target.value;
                                setAfterDate(newAfterDate);
                                // If beforeDate is not set or is greater than new afterDate, update it
                                if (!beforeDate || new Date(beforeDate) >= new Date(newAfterDate)) {
                                    setBeforeDate(newAfterDate);
                                }
                                setSetFilters(true);
                            }}
                            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                            className="input h-8 w-full"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="turnstile" className="block">Turnstile.</label>
                        <input
                            type="number"
                            id="turnstile"
                            value={turnstile}
                            onChange={(e) => setTurnstile(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                            className="input h-8 w-full"
                            placeholder="Enter Turnstile"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="hasSignedOut" className="block">Signed Out</label>
                        <select
                            id="hasSignedOut"
                            value={hasSignedOut}
                            onChange={(e) => {
                                setHasSignedOut(e.target.value as "yes" | "no" | "either")
                                setSetFilters(true);
                            }}
                            className="input h-8 w-full"
                        >
                            <option value="either">...</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="cardNumber" className="block">Card No.</label>
                        <input
                            type="number"
                            id="cardNumber"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                            className="input h-8 w-full"
                            placeholder="Enter Card No."
                        />
                    </div>
                    <div className="flex flex-col col-span-2">
                        <label htmlFor="name" className="block">Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                            className="input h-8 w-full"
                            placeholder="Enter Name"
                        />
                    </div>
                    <div className="flex flex-col col-span-1">
                        <div className="flex space-x-4 py-2 justify-end mt-4">
                            {/* Filter Buttons */}
                            <button
                                onClick={applyFilters}
                                className="font-bold bg-primary text-black px-4 py-1 rounded shadow-md shadow-dark "
                            >
                                Confirm
                            </button>
                            <button
                                onClick={clearFilters}
                                className="font-bold bg-light text-white px-4 py-1 rounded shadow-md shadow-dark "
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

            </div>


            <HorizontalRule />

            <div className="flex justify-between space-x-2 items-center w-full text-sm sm:text-md lg:text-lg">
                <h1>
                    <span className="hidden md:inline">Total Results: </span>
                    <span className="md:hidden">Total: </span>
                    {totalEvents}
                </h1>
                <div className="flex space-x-4 justify-center items-center">
                    
                    <input
                        type="checkbox"
                        id="uniqueEntries"
                        checked={isUnique}
                        onChange={(e) => setIsUnique(e.target.checked)}
                        className={`h-6 w-6 border-2 rounded-md transition-all duration-300
                                ${isUnique ? 'bg-green-500 border-green-700' : 'bg-gray-700 border-gray-800'} 
                                checked:bg-white checked:border-transparent focus:ring-0`}
                    />
                    <p>
                        <span className="hidden md:inline">Dedupe users? (Date must be selected)</span>
                        <span className="md:hidden">Dedupe? </span>
                    </p>
                </div>
                <div className="flex w-[200px] space-x-2">
                    <select
                        value={sortBy}
                        onChange={(e) => {
                            setSortBy(e.target.value as "entryTime" | "exitTime" | "cardNumber" | "name")
                            setSetFilters(true);
                        }}
                        className="input h-8 w-full"
                    >
                        <option value="entryTime">Entry Time</option>
                        <option value="exitTime">Exit Time</option>
                        <option value="cardNumber">Card Number</option>
                        <option value="name">Name</option>
                    </select>
                    <button
                        onClick={() => {
                            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                            setSetFilters(true);
                        }}
                        className="px-2 bg-primary rounded-md hover:bg-primary/80"
                    >
                        {sortOrder === "asc" ? "↑" : "↓"}
                    </button>
                </div>
            </div>

            {loading ? (<Spinner />) : eventData}

            {/* Pagination controls */}
            {!loading && events && events.length > 0 ? (
            <div className="flex justify-between pt-4">
                <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="font-bold px-4 py-2 bg-primary hover:bg-primary/80 text-black rounded disabled:bg-transparent disabled:text-transparent"
                >
                    Previous
                </button>
                <span className="text-lg">{`Page ${currentPage} of ${totalPages}`}</span>
                <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="font-bold px-4 py-2 bg-primary hover:bg-primary/80 text-black rounded disabled:bg-gray-300 disabled:bg-transparent disabled:text-transparent "
                >
                    Next
                </button>
            </div>
            ) : null}

            {/* Export Section */}
            {!loading && events && events.length > 0 ? (
            <div className="mt-8 border-t border-gray-700 pt-4">
                <p className="text-sm text-gray-400 mb-4">
                    Export the currently filtered data to CSV or PDF format. The export will include all matching records, not just the current page.
                </p>
                <div className="flex space-x-4">
                    <button
                        onClick={handleCSVExport}
                        className="font-bold bg-primary hover:bg-primary/80 text-black px-6 py-2 rounded shadow-md shadow-dark transition-colors duration-200"
                    >
                        Export CSV
                    </button>
                    <button
                        onClick={handlePDFExport}
                        className="font-bold bg-primary hover:bg-primary/80 text-black px-6 py-2 rounded shadow-md shadow-dark transition-colors duration-200"
                    >
                        Export PDF
                    </button>
                </div>
            </div>
            ) : null}

        </div>
    );;
}