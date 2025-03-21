"use server";

import { createClient } from "@/utils/supabase/server";

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
};

export type PastEvent = {
	id: string;
	name: string;
	end_date: string;
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
	const supabase = await createClient();

	const now = new Date();

	const { data: events, error } = await supabase
		.from("events")
		.select(`
      id,
      name,
      end_date,
      event_entries!inner (
        id,
        name,
        city,
        prize_id
      )
    `)
		.lt("end_date", now.toISOString().split("T")[0])
		.order("end_date", { ascending: false })
		.limit(12);

	if (error) {
		console.error("Error fetching past events:", error);
		return [];
	}

	return events.map((event) => ({
		...event,
		winners: event.event_entries
			.filter((entry: EventEntry) => entry.prize_id)
			.map((entry: EventEntry) => ({
				name: entry.name,
				city: entry.city,
				entry_id: entry.id,
				prize_id: entry.prize_id || "",
			})),
	}));
}

export async function getEventById(
	eventId: string,
): Promise<EventWithPrizes | null> {
	const supabase = await createClient();

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
      event_entries!inner (
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
