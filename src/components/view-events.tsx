import {useEffect, useState} from "react";
import Spinner from "@/components/spinner";
import HorizontalRule from "@/components/horizontal-rule";

export default function ViewEvents() {
    const [events, setEvents] = useState<any[]>([]);
    const [expandedIndex, setExpandedIndex] = useState(-1);
    const [hoverIndex, setHoverIndex] = useState(-1);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [beforeDate, setBeforeDate] = useState<string>("");
    const [afterDate, setAfterDate] = useState<string>("");
    const [cardNumber, setCardNumber] = useState<string>("");
    const [turnstile, setTurnstile] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [resetFilters, setResetFilters] = useState(false);

    const fetchEvents = async (page: number) => {
        try {
            const queryParams: any = {
                page: currentPage,
                limit: 25,
            };
            if (beforeDate) queryParams.before = new Date(beforeDate).toISOString();
            if (afterDate) queryParams.after = new Date(afterDate).toISOString();
            if (cardNumber) queryParams.cardNumber = cardNumber;
            if (name) queryParams.name = name;
            if (turnstile) queryParams.turnstile = turnstile;

            const response = await fetch(`/api/scan-events?${new URLSearchParams(queryParams)}`);
            const data = await response.json();
            setEvents(data.data);
            setTotalPages(data.totalPages);
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
        setCardNumber("");
        setName("");
        setTurnstile("");
        setCurrentPage(1);
        setResetFilters(true);
    };

// Run applyFilters *only* after state updates
    useEffect(() => {
        if (resetFilters) {
            applyFilters();
            setResetFilters(false);
        }
    }, [resetFilters]);

    // Use effect is called when the component is mounted
    useEffect(() => {
        setLoading(true);
        setExpandedIndex(-1);
        fetchEvents(currentPage).then(() =>
            setLoading(false)
        );
    }, [currentPage]);

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
                    <span className="absolute top-2 left-5 text-xl font-bold capitalize">
                    {event.name}
                </span>

                    {/* Top Right: cardNumber */}
                    <span className={`absolute top-2 right-5 text-2xl font-bold`}>
                    {event.cardNumber}
                </span>

                    {/* Bottom Left: Time/ Date */}
                    <span className="absolute bottom-2 left-5 text-md text-primary">
                  {
                      (() => {
                          const eventTime = new Date(event.time);
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
                          }).format(eventTime);

                          const displayDate = formattedDate.replace(",", ""); // To remove any comma
                          return displayDate;
                      })()
                  }
                </span>
                    {/* Expanded Section */}
                    {expandedIndex === index && (
                        <div className="mt-2 text-sm bg-mid p-4 w-100">
                            <p className="font-bold">Card Tech: {event.cardTechnology}</p>
                            <p>
                                <span className="font-bold">{"Turnstile: " + event.turnstile}</span>{" "}
                            </p>
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
            <div className={"p-2"}>
                {/* Date Filter Section */}
                <div className="grid grid-cols-2 sm:grid-cols-4  gap-x-2 gap-y-1 py-2 w-full">
                    <div className="flex flex-col col-span-2">
                        <label htmlFor="afterDate" className="block">After</label>
                        <input
                            type="datetime-local"
                            id="afterDate"
                            value={afterDate}
                            onChange={(e) => setAfterDate(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                            className="input h-8 w-full"
                        />
                    </div>
                    <div className="flex flex-col col-span-2">
                        <label htmlFor="beforeDate" className="block">Before</label>
                        <input
                            type="datetime-local"
                            id="beforeDate"
                            value={beforeDate}
                            onChange={(e) => setBeforeDate(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                            className="input h-8 w-full"
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
                </div>

                <div className="flex space-x-4 py-2 justify-end">

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
            <HorizontalRule />

            {loading ? (<Spinner />) : eventData}

            {/* Pagination controls */}
            {!loading && events && events.length > 0 ? (
            <div className="flex justify-between pt-4">
                <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="font-bold px-4 py-2 bg-primary text-black rounded disabled:bg-transparent disabled:text-transparent"
                >
                    Previous
                </button>
                <span className="text-lg">{`Page ${currentPage} of ${totalPages}`}</span>
                <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="font-bold px-4 py-2 bg-primary text-black rounded disabled:bg-gray-300 disabled:bg-transparent disabled:text-transparent "
                >
                    Next
                </button>
            </div>
            ) : null}

        </div>
    );;
}