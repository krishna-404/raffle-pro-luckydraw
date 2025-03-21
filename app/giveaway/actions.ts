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

export type PastEvent = {
	id: string;
	name: string;
	end_date: string;
	winner: {
		name: string;
		city: string;
		entry_id: string;
	} | null;
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
		winner: event.event_entries?.find((entry) => entry.prize_id)
			? {
					name: event.event_entries.find((entry) => entry.prize_id)?.name || "",
					city: event.event_entries.find((entry) => entry.prize_id)?.city || "",
					entry_id:
						event.event_entries.find((entry) => entry.prize_id)?.id || "",
				}
			: null,
	}));
}
