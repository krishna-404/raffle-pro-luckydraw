import { createClient } from "@/utils/supabase/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * API endpoint to fetch all existing event dates
 * Returns an array of date ranges for all events in the database
 */
export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient();

		// Check if user is authenticated
		const {
			data: { session },
		} = await supabase.auth.getSession();
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Fetch all events with their date ranges
		const { data: events, error } = await supabase
			.from("events")
			.select("id, name, start_date, end_date")
			.order("start_date", { ascending: true });

		if (error) {
			console.error("Error fetching event dates:", error);
			return NextResponse.json(
				{ error: `Failed to fetch event dates: ${error.message}` },
				{ status: 500 },
			);
		}

		// Format the response
		const eventDates = events.map((event) => ({
			id: event.id,
			name: event.name,
			startDate: event.start_date,
			endDate: event.end_date,
		}));

		return NextResponse.json({ events: eventDates });
	} catch (error) {
		console.error("Error in event dates API:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: "An unexpected error occurred",
			},
			{ status: 500 },
		);
	}
}
