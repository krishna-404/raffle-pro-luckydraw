"use server";

import { messageService } from "@/lib/message-service";
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

/**
 * Sends a notification message to the winner about their prize
 * This function is designed to be non-blocking (fire and forget)
 */
function sendWinnerNotification(
	winnerName: string,
	winnerMobile: string,
	eventName: string,
	prizeName: string,
	entryId: string,
	eventId: string,
) {
	// Don't await this promise to keep it non-blocking
	messageService
		.sendMessage(
			{
				mobiles: winnerMobile,
				part_name: winnerName,
				event_name: eventName,
				prize_name: prizeName,
				part_id: entryId,
				event_id: eventId,
			},
			process.env.MSG91_WINNER_TEMPLATE_ID,
		)
		.then((result) => {
			if (!result.success) {
				console.error("Failed to send winner notification:", result.error);
			}
		})
		.catch((error) => {
			console.error("Error sending winner notification:", error);
		});
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
	const endDate = new Date(event.end_date);
	// Set end date to end of day (23:59:59.999) for proper comparison
	endDate.setHours(23, 59, 59, 999);

	if (startDate > now) {
		return { error: "Event has not started yet" };
	}

	if (endDate > now) {
		return {
			error:
				"Event has not ended yet. Please wait until the end date to select winners.",
		};
	}

	// Get all prizes for the event, ordered by seniority
	const { data: prizes, error: prizesError } = await supabase
		.from("prizes")
		.select("id, name, seniority_index")
		.eq("event_id", eventId)
		.order("seniority_index", { ascending: true });

	if (prizesError || !prizes || prizes.length === 0) {
		console.error("Error fetching prizes:", prizesError);
		return { error: "No prizes found for this event" };
	}

	// Track phone numbers that have already won to prevent duplicates
	const winningPhoneNumbers = new Set<string>();

	// Process each prize in order of seniority
	for (const prize of prizes) {
		try {
			// Get all eligible entries (not won yet) for this event
			let query = supabase
				.from("event_entries")
				.select("id, name, whatsapp_number")
				.eq("event_id", eventId)
				.is("prize_id", null); // Only get entries that haven't won yet

			// Only add the phone number filter if there are winning numbers
			if (winningPhoneNumbers.size > 0) {
				// Convert Set to array for the query
				const phoneNumbers = Array.from(winningPhoneNumbers);

				// Use separate .neq filters for each phone number
				for (const phone of phoneNumbers) {
					query = query.neq("whatsapp_number", phone);
				}
			}

			const { data: entries, error: entriesError } = await query;

			if (entriesError) {
				throw entriesError;
			}

			if (!entries || entries.length === 0) {
				return {
					error: `Not enough unique eligible entries for prize "${prize.name}". Some phone numbers may have already won other prizes.`,
				};
			}

			// Randomly select a winner from eligible entries
			const winner = entries[Math.floor(Math.random() * entries.length)];

			// Update entry with prize assignment
			const { error: updateError } = await supabase
				.from("event_entries")
				.update({ prize_id: prize.id })
				.eq("id", winner.id);

			if (updateError) {
				throw updateError;
			}

			// Add winner's phone number to the set of winning numbers
			winningPhoneNumbers.add(winner.whatsapp_number);

			// Send notification to winner (non-blocking)
			sendWinnerNotification(
				winner.name,
				winner.whatsapp_number,
				event.name,
				prize.name,
				winner.id,
				eventId,
			);
		} catch (error) {
			console.error(`Error processing prize ${prize.name}:`, error);
			return { error: "Failed to process winners. Please try again." };
		}
	}

	return { winnersCount: prizes.length };
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
