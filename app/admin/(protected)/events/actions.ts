"use server";

import { createClient } from "@/utils/supabase/server";

export type Event = {
	id: string;
	created_by_admin: string;
	name: string;
	description: string | null;
	start_date: string;
	end_date: string;
	created_at: string;
	updated_at: string;
	entry_count: number;
	prize_count: number;
	winner_count: number;
	status: "upcoming" | "active" | "ended";
};

export type Winner = {
	id: string;
	name: string;
	whatsapp_number: string;
	email: string | null;
	city: string;
	prize_name: string;
	prize_id: string;
};

type EntryWithPrize = {
	id: string;
	prize_id: string | null;
};

type WinnerEntry = {
	id: string;
	name: string;
	whatsapp_number: string;
	email: string | null;
	prize_id: string;
	prizes: { name: string } | null;
};

// Define types for Supabase response
type EventWithPrizes = {
	id: string;
	name: string;
	description: string | null;
	start_date: string;
	end_date: string;
	prizes: Array<{
		id: string;
		name: string;
		description: string | null;
		image_url: string | null;
		seniority_index: number;
	}> | null;
};

export async function getEvents(): Promise<{ data: Event[]; total: number }> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("events")
		.select(`
      *,
      entry_count:event_entries(count),
      prize_count:prizes(count),
      winner_count:event_entries(id, prize_id)
    `)
		.order("start_date", { ascending: false });

	if (error) {
		throw new Error(error.message);
	}

	const now = new Date();
	const eventsWithStatus = data.map((event) => {
		// Count entries with prize_id not null
		const winnerCount = Array.isArray(event.winner_count)
			? event.winner_count.filter(
					(entry: EntryWithPrize) => entry.prize_id !== null,
				).length
			: 0;

		// For end date comparison, we need to set the time to the end of day (23:59:59.999)
		// to ensure the event is considered active until the end of its end date
		const endDate = new Date(event.end_date);
		endDate.setHours(23, 59, 59, 999);

		return {
			...event,
			entry_count: event.entry_count?.[0]?.count || 0,
			prize_count: event.prize_count?.[0]?.count || 0,
			winner_count: winnerCount,
			status:
				new Date(event.start_date) > now
					? "upcoming"
					: endDate < now
						? "ended"
						: "active",
		};
	});

	return {
		data: eventsWithStatus,
		total: eventsWithStatus.length,
	};
}

export async function getEventWinners(eventId: string): Promise<Winner[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("event_entries")
		.select(`
      id,
      name,
      whatsapp_number,
      email,
      city,
      prize_id,
      prizes:prize_id (name)
    `)
		.eq("event_id", eventId)
		.not("prize_id", "is", null)
		.order("created_at", { ascending: false });

	if (error) {
		console.error("Error fetching winners:", error);
		throw new Error("Failed to fetch winners");
	}

	// Use a type assertion after converting to unknown to safely handle the complex structure
	return (
		data as unknown as Array<{
			id: string;
			name: string;
			whatsapp_number: string;
			email: string | null;
			city: string;
			prize_id: string;
			prizes: { name: string } | null;
		}>
	).map((entry) => ({
		id: entry.id,
		name: entry.name,
		whatsapp_number: entry.whatsapp_number,
		email: entry.email,
		city: entry.city,
		prize_id: entry.prize_id,
		prize_name: entry.prizes?.name || "Unknown Prize",
	}));
}

export async function findEventWinners(
	eventId: string,
): Promise<{ error?: string; winnersCount?: number }> {
	const supabase = await createClient();

	// Get event details
	const { data: event, error: eventError } = await supabase
		.from("events")
		.select("*")
		.eq("id", eventId)
		.single();

	if (eventError) {
		console.error("Error fetching event:", eventError);
		return { error: "Failed to fetch event details" };
	}

	// Check if event has started
	const now = new Date();
	const startDate = new Date(event.start_date);
	if (startDate > now) {
		return { error: "Event has not started yet" };
	}

	// Get all prizes for the event
	const { data: prizes, error: prizesError } = await supabase
		.from("prizes")
		.select("id, seniority_index")
		.eq("event_id", eventId)
		.order("seniority_index", { ascending: true });

	if (prizesError || !prizes || prizes.length === 0) {
		console.error("Error fetching prizes:", prizesError);
		return { error: "No prizes found for this event" };
	}

	// Get all entries for the event
	const { data: entries, error: entriesError } = await supabase
		.from("event_entries")
		.select("id")
		.eq("event_id", eventId)
		.is("prize_id", null); // Only get entries that haven't won yet

	if (entriesError || !entries) {
		console.error("Error fetching entries:", entriesError);
		return { error: "Failed to fetch entries" };
	}

	if (entries.length === 0) {
		return { error: "No eligible entries found for this event" };
	}

	if (entries.length < prizes.length) {
		return {
			error: `Not enough entries (${entries.length}) for the number of prizes (${prizes.length})`,
		};
	}

	// Shuffle entries to randomize selection
	const shuffledEntries = [...entries].sort(() => Math.random() - 0.5);

	// Select winners (one for each prize)
	const winners = prizes.map((prize, index) => ({
		entryId: shuffledEntries[index].id,
		prizeId: prize.id,
	}));

	// Update entries with prize assignments
	for (const winner of winners) {
		const { error: updateError } = await supabase
			.from("event_entries")
			.update({ prize_id: winner.prizeId })
			.eq("id", winner.entryId);

		if (updateError) {
			console.error("Error updating entry with prize:", updateError);
			return { error: "Failed to assign prizes to winners" };
		}
	}

	return { winnersCount: winners.length };
}

export async function deleteEvent(eventId: string) {
	const supabase = await createClient();

	// First check if event has entries
	const { count: entryCount } = await supabase
		.from("event_entries")
		.select("*", { count: "exact", head: true })
		.eq("event_id", eventId);

	if (entryCount && entryCount > 0) {
		throw new Error(`Cannot delete event because it has ${entryCount} entries`);
	}

	// Delete all prizes associated with the event first
	const { error: prizeDeletionError } = await supabase
		.from("prizes")
		.delete()
		.eq("event_id", eventId);

	if (prizeDeletionError) {
		throw new Error("Failed to delete associated prizes");
	}

	// Now delete the event
	const { error } = await supabase.from("events").delete().eq("id", eventId);

	if (error) {
		throw error;
	}
}

/**
 * Fetches a specific event by ID with its prizes for preview
 */
export async function getEventForPreview(eventId: string): Promise<{
	id: string;
	name: string;
	description: string | null;
	start_date: string;
	end_date: string;
	prizes: Array<{
		id: string;
		name: string;
		description: string | null;
		image_url: string | null;
		seniority_index: number;
	}>;
}> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("events")
		.select(`
      id,
      name,
      description,
      start_date,
      end_date,
      prizes (
        id,
        name,
        description,
        image_url,
        seniority_index
      )
    `)
		.eq("id", eventId)
		.single();

	if (error) {
		throw new Error(`Failed to fetch event: ${error.message}`);
	}

	// Ensure the returned data matches the expected type
	const eventData: EventWithPrizes = data;

	return {
		...eventData,
		prizes: eventData.prizes || [],
	};
}
