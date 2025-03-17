import { useEffect, useState } from "react";

interface EventDate {
	id: string;
	name: string;
	startDate: Date;
	endDate: Date;
}

interface EventDateResponse {
	id: string;
	name: string;
	startDate: string;
	endDate: string;
}

export function useEventDates() {
	const [eventDates, setEventDates] = useState<EventDate[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchEventDates = async () => {
			try {
				setIsLoading(true);
				const response = await fetch("/api/admin/events/dates");

				if (!response.ok) {
					throw new Error("Failed to fetch event dates");
				}

				const data = await response.json();

				// Convert string dates to Date objects
				const formattedDates = data.events.map((event: EventDateResponse) => ({
					id: event.id,
					name: event.name,
					startDate: new Date(event.startDate),
					endDate: new Date(event.endDate),
				}));

				setEventDates(formattedDates);
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
				console.error("Error fetching event dates:", err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchEventDates();
	}, []);

	return { eventDates, isLoading, error };
}
