"use server";

import { createClient } from "@/utils/supabase/server";

export type Winner = {
	id: string;
	name: string;
	email: string | null;
	whatsapp_number: string;
	company_name: string | null;
	address: string;
	city: string;
	pincode: string;
	event_name: string;
	prize_name: string;
	created_at: string;
	request_ip_address: string | null;
	request_user_agent: string | null;
};

// Define a type for the raw winner data from Supabase
type WinnerRawData = {
	id: string;
	name: string;
	email: string | null;
	whatsapp_number: string;
	company_name: string | null;
	address: string;
	city: string;
	pincode: string;
	created_at: string;
	request_ip_address?: string;
	request_user_agent?: string;
	events?: { name: string } | null;
	prizes?: { name: string } | null;
	// Use a more specific type for additional properties
	[key: string]:
		| string
		| number
		| boolean
		| null
		| undefined
		| { name: string }
		| null;
};

export type PaginationParams = {
	page: number;
	pageSize: number;
};

export async function getWinners(
	{ page = 1, pageSize = 10 }: PaginationParams = { page: 1, pageSize: 10 },
): Promise<{
	data: Winner[];
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
      id,
      name,
      email,
      whatsapp_number,
      company_name,
      address,
      city,
      pincode,
      created_at,
      request_ip_address,
      request_user_agent,
      events:event_id (name),
      prizes:prize_id (name)
    `,
			{ count: "exact" },
		)
		.not("prize_id", "is", null)
		.order("created_at", { ascending: false })
		.range(from, to);

	if (error) {
		console.error("Error fetching winners:", error);
		throw new Error("Failed to fetch winners");
	}

	// Use a type assertion after converting to unknown to safely handle the complex structure
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const formattedData = (data as unknown[]).map((winner: any) => ({
		id: winner.id,
		name: winner.name,
		email: winner.email,
		whatsapp_number: winner.whatsapp_number,
		company_name: winner.company_name,
		address: winner.address,
		city: winner.city,
		pincode: winner.pincode,
		event_name: winner.events?.name || "Unknown Event",
		prize_name: winner.prizes?.name || "Unknown Prize",
		created_at: winner.created_at,
		request_ip_address: winner.request_ip_address || null,
		request_user_agent: winner.request_user_agent || null,
	}));

	const totalPages = Math.ceil((count || 0) / pageSize);

	return {
		data: formattedData,
		total: count || 0,
		page,
		pageSize,
		totalPages,
	};
}

export async function getWinnersByEvent(eventId: string): Promise<Winner[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("event_entries")
		.select(`
      id,
      name,
      email,
      whatsapp_number,
      company_name,
      address,
      city,
      pincode,
      created_at,
      request_ip_address,
      request_user_agent,
      events:event_id (name),
      prizes:prize_id (name)
    `)
		.eq("event_id", eventId)
		.not("prize_id", "is", null)
		.order("created_at", { ascending: false });

	if (error) {
		console.error("Error fetching winners by event:", error);
		throw new Error("Failed to fetch winners");
	}

	// Use a type assertion after converting to unknown to safely handle the complex structure
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	return (data as unknown[]).map((winner: any) => ({
		id: winner.id,
		name: winner.name,
		email: winner.email,
		whatsapp_number: winner.whatsapp_number,
		company_name: winner.company_name,
		address: winner.address,
		city: winner.city,
		pincode: winner.pincode,
		event_name: winner.events?.name || "Unknown Event",
		prize_name: winner.prizes?.name || "Unknown Prize",
		created_at: winner.created_at,
		request_ip_address: winner.request_ip_address || null,
		request_user_agent: winner.request_user_agent || null,
	}));
}
