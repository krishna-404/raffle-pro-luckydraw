import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { NextResponse } from "next/server";

interface WinnerData {
	id: string;
	name: string;
	email: string | null;
	whatsapp_number: string;
	company_name: string | null;
	address: string;
	city: string;
	pincode: string;
	created_at: string;
	events?: { name: string } | null;
	prizes?: { name: string } | null;
}

export async function GET() {
	try {
		const supabase = await createClient();

		// Fetch all winners
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
        events:event_id (name),
        prizes:prize_id (name)
      `)
			.not("prize_id", "is", null)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching winners for export:", error);
			return NextResponse.json(
				{ error: "Failed to fetch winners" },
				{ status: 500 },
			);
		}

		// Format data for CSV
		const formattedData = (data as unknown as WinnerData[]).map((winner) => ({
			id: winner.id,
			name: winner.name,
			email: winner.email || "",
			whatsapp_number: winner.whatsapp_number,
			company_name: winner.company_name || "",
			address: winner.address,
			city: winner.city,
			pincode: winner.pincode,
			event_name: winner.events?.name || "Unknown Event",
			prize_name: winner.prizes?.name || "Unknown Prize",
			created_at: format(new Date(winner.created_at), "yyyy-MM-dd HH:mm:ss"),
		}));

		// Convert to CSV
		const headers = [
			"Entry ID",
			"Name",
			"Email",
			"WhatsApp Number",
			"Company Name",
			"Address",
			"City",
			"Pincode",
			"Event",
			"Prize",
			"Created At",
		];

		const rows = formattedData.map((row) => [
			`"${row.id}"`,
			`"${row.name.replace(/"/g, '""')}"`,
			`"${row.email.replace(/"/g, '""')}"`,
			`"${row.whatsapp_number}"`,
			`"${row.company_name.replace(/"/g, '""')}"`,
			`"${row.address.replace(/"/g, '""')}"`,
			`"${row.city.replace(/"/g, '""')}"`,
			`"${row.pincode}"`,
			`"${row.event_name.replace(/"/g, '""')}"`,
			`"${row.prize_name.replace(/"/g, '""')}"`,
			`"${row.created_at}"`,
		]);

		const csvContent = [
			headers.join(","),
			...rows.map((row) => row.join(",")),
		].join("\n");

		// Return CSV file
		return new NextResponse(csvContent, {
			headers: {
				"Content-Type": "text/csv",
				"Content-Disposition": `attachment; filename="winners-${new Date().toISOString().split("T")[0]}.csv"`,
			},
		});
	} catch (error) {
		console.error("Error generating CSV:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
