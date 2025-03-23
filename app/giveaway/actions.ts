"use server";

import { createClient, createServiceRoleClient } from "@/utils/supabase/server";

export type Prize = {
	id: string;
	name: string;
	description: string | null;
	image_url: string | null;
	seniority_index: number;
};

export type ActiveEvent = {
	id: string;
	name: string;
	description: string | null;
	start_date: string;
	end_date: string;
	prizes: Prize[];
};

export type Winner = {
	name: string;
	city: string;
	entry_id: string;
	prize_id: string;
	prize_name?: string;
};

export type PastEvent = {
	id: string;
	name: string;
	description: string | null;
	end_date: string;
	prizes: Prize[];
	winners: Winner[];
};

export type EventWithPrizes = {
	id: string;
	name: string;
	description: string | null;
	start_date: string;
	end_date: string;
	prizes: Prize[];
	winners: Winner[];
};

type EventEntry = {
	id: string;
	name: string;
	city: string;
	prize_id: string | null;
};

export async function getActiveEvent(): Promise<ActiveEvent | null> {
	const supabase = await createClient();

	const now = new Date();

	const { data: events, error } = await supabase
		.from("events")
		.select(`
      *,
      prizes (
        id,
        name,
        description,
        image_url,
        seniority_index
      )
    `)
		.gte("end_date", now.toISOString().split("T")[0]) // Compare only the date part
		.lte("start_date", now.toISOString().split("T")[0])
		.order("start_date", { ascending: false })
		.limit(1)
		.single();

	if (error) {
		return null;
	}

	return events as ActiveEvent;
}

export async function getPastEvents(): Promise<PastEvent[]> {
	const supabase = await createServiceRoleClient();

	// Get today's date at start of day in IST
	const now = new Date();
	now.setHours(0, 0, 0, 0);

	// First get all past events
	const { data: events, error } = await supabase
		.from("events")
		.select(`
      id,
      name,
      description,
      end_date,
      prizes!left (
        id,
        name,
        description,
        image_url,
        seniority_index
      ),
      event_entries!left (
        id,
        name,
        city,
        prize_id
      )
    `)
		.lt("start_date", now.toISOString()) // Events that have started before today
		.order("end_date", { ascending: false })
		.limit(12);

	if (error) {
		console.error("Error fetching past events:", error);
		return [];
	}

	const mappedEvents = events.map((event) => ({
		id: event.id,
		name: event.name,
		description: event.description,
		end_date: event.end_date,
		prizes: event.prizes || [],
		winners: (event.event_entries || [])
			.filter((entry: EventEntry) => entry.prize_id)
			.map((entry: EventEntry) => {
				const prize = event.prizes?.find((p) => p.id === entry.prize_id);
				return {
					name: entry.name,
					city: entry.city,
					entry_id: entry.id,
					prize_id: entry.prize_id || "",
					prize_name: prize?.name || "Unknown Prize",
				};
			}),
	}));
	return mappedEvents;
}

export async function getEventById(
	eventId: string,
): Promise<EventWithPrizes | null> {
	const supabase = await createServiceRoleClient();

	const { data: event, error } = await supabase
		.from("events")
		.select(`
      *,
      prizes (
        id,
        name,
        description,
        image_url,
        seniority_index
      ),
      event_entries!left (
        id,
        name,
        city,
        prize_id
      )
    `)
		.eq("id", eventId)
		.single();

	if (error) {
		console.error("Error fetching event:", error);
		return null;
	}

	if (!event) {
		return null;
	}

	return {
		...event,
		winners: event.event_entries
			.filter((entry: EventEntry) => entry.prize_id)
			.map((entry: EventEntry) => ({
				name: entry.name,
				city: entry.city,
				entry_id: entry.id,
				prize_id: entry.prize_id || "",
			})),
	};
}
