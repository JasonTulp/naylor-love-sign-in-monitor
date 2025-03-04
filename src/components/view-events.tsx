import {useEffect, useState} from "react";

export default function ViewEvents() {
    const [events, setEvents] = useState<any[]>([]);
    const [expandedIndex, setExpandedIndex] = useState(-1);
    const [hoverIndex, setHoverIndex] = useState(-1);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('/api/scan-events');
                const data = await response.json();
                setEvents(data.data);
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        };

        fetchEvents();
    }, []); // Empty dependency array to run only once after mount

    if (!events || !events.length || !events[0].time) {
        return (
            <h2>No event data available</h2>
        );
    }

    const eventData = <div className="space-y-2 pt-4 w-full mx-auto">
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
                    {event.firstNames + " " + event.lastName}
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

    return (
        <div className="w-full">
            <div className={"p-2"}>
                <h1 className="text-2xl text-primary font-bold">Scan Event History</h1>
                <p>Filters coming soon...</p>
            </div>
            {eventData}
        </div>
    );;
}