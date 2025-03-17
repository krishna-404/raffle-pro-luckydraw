"use server";

import { createClient } from "@/utils/supabase/server";

export type Entry = {
	id: string;
	event_id: string;
	event_name: string;
	name: string;
	email: string | null;
	whatsapp_number: string;
	address: string;
	city: string;
	pincode: string;
	qr_code_id: string | null;
	prize_id: string | null;
	prize_name: string | null;
	created_at: string;
	request_ip_address?: string | null;
	request_user_agent?: string | null;
};

export type PaginationParams = {
	page: number;
	pageSize: number;
};

export async function getEntries(
	{ page = 1, pageSize = 10 }: PaginationParams = { page: 1, pageSize: 10 },
): Promise<{
	data: Entry[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}> {
	const supabase = await createClient();

	// Calculate pagination values
	const from = (page - 1) * pageSize;
	const to = from + pageSize - 1;

	const { data, error, count } = await supabase
		.from("event_entries")
		.select(
			`
      *,
      events:event_id (name),
      prizes:prize_id (name)
    `,
			{ count: "exact" },
		)
		.order("created_at", { ascending: false })
		.range(from, to);

	if (error) {
		console.error("Error fetching entries:", error);
		throw new Error("Failed to fetch entries");
	}

	const formattedData = data.map((entry) => ({
		...entry,
		event_name: entry.events?.name || "Unknown Event",
		prize_name: entry.prizes?.name || null,
	}));

	const totalPages = Math.ceil((count || 0) / pageSize);

	return {
		data: formattedData as Entry[],
		total: count || 0,
		page,
		pageSize,
		totalPages,
	};
}
