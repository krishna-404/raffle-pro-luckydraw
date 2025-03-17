"use server";

import { createClient } from "@/utils/supabase/server";

export type MessageLog = {
	id: string;
	template_id: string;
	recipient_mobile: string;
	event_id: string | null;
	event_name: string | null;
	event_entry_id: string | null;
	entry_name: string | null;
	message_variables: Record<string, string | number>;
	status: string;
	response_data: Record<string, unknown> | null;
	error_message: string | null;
	created_at: string;
	updated_at: string;
};

export type PaginationParams = {
	page: number;
	pageSize: number;
};

export async function getMessageLogs(
	{ page = 1, pageSize = 10 }: PaginationParams = { page: 1, pageSize: 10 },
): Promise<{
	data: MessageLog[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
	statusCounts: Record<string, number>;
}> {
	const supabase = await createClient();

	// Calculate pagination values
	const from = (page - 1) * pageSize;
	const to = from + pageSize - 1;

	// Fetch message logs with related data
	const { data, error, count } = await supabase
		.from("message_logs")
		.select(
			`
      *,
      events:event_id (name),
      event_entries:event_entry_id (name)
    `,
			{ count: "exact" },
		)
		.order("created_at", { ascending: false })
		.range(from, to);

	if (error) {
		console.error("Error fetching message logs:", error);
		throw new Error("Failed to fetch message logs");
	}

	// Get status counts for filtering
	const { data: statusData, error: statusError } = await supabase.rpc(
		"get_message_status_counts",
	);

	if (statusError) {
		console.error("Error fetching status counts:", statusError);
	}

	// Format status counts
	const statusCounts: Record<string, number> = {};
	if (statusData) {
		for (const item of statusData) {
			statusCounts[item.status] = item.count;
		}
	}

	// Format the data
	const formattedData = data.map((log) => ({
		...log,
		event_name: log.events?.name || null,
		entry_name: log.event_entries?.name || null,
	}));

	const totalPages = Math.ceil((count || 0) / pageSize);

	return {
		data: formattedData as MessageLog[],
		total: count || 0,
		page,
		pageSize,
		totalPages,
		statusCounts,
	};
}

export async function exportMessageLogs(): Promise<MessageLog[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("message_logs")
		.select(`
      *,
      events:event_id (name),
      event_entries:event_entry_id (name)
    `)
		.order("created_at", { ascending: false });

	if (error) {
		console.error("Error exporting message logs:", error);
		throw new Error("Failed to export message logs");
	}

	// Format the data
	const formattedData = data.map((log) => ({
		...log,
		event_name: log.events?.name || null,
		entry_name: log.event_entries?.name || null,
	}));

	return formattedData as MessageLog[];
}
