import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const supabase = await createClient();

		// Check if user is authenticated
		const {
			data: { session },
		} = await supabase.auth.getSession();
		if (!session) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		// Fetch all entries with related data
		const { data, error } = await supabase
			.from("event_entries")
			.select(`
        *,
        events:event_id (name),
        prizes:prize_id (name)
      `)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching entries:", error);
			return new NextResponse("Failed to fetch entries", { status: 500 });
		}

		// Convert data to CSV format
		const headers = [
			"Entry ID",
			"Event",
			"Name",
			"Email",
			"WhatsApp Number",
			"Company Name",
			"Address",
			"City",
			"Pincode",
			"QR Code ID",
			"Prize",
			"Created At",
		];

		const rows = data.map((entry) => [
			entry.id,
			entry.events?.name || "Unknown Event",
			entry.name,
			entry.email || "",
			entry.whatsapp_number,
			entry.company_name || "",
			entry.address,
			entry.city,
			entry.pincode,
			entry.qr_code_id || "",
			entry.prizes?.name || "",
			new Date(entry.created_at).toLocaleString(),
		]);

		const csvContent = [
			headers.join(","),
			...rows.map((row) =>
				row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
			),
		].join("\n");

		// Return CSV file
		return new NextResponse(csvContent, {
			headers: {
				"Content-Type": "text/csv",
				"Content-Disposition": `attachment; filename="entries-${new Date().toISOString().split("T")[0]}.csv"`,
			},
		});
	} catch (error) {
		console.error("Error generating CSV:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
