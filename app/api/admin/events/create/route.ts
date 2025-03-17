import { checkDateOverlap } from "@/app/admin/(protected)/events/create/actions";
import type { Database } from "@/types/supabase";
import { createClient } from "@/utils/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Define a type for the prize data
interface PrizeInput {
	name: string;
	description: string;
	seniority_index?: number;
}

/**
 * Handles prize image upload to Supabase storage
 */
async function handlePrizeImageUpload(
	supabase: SupabaseClient<Database>,
	image: File,
	fileName: string,
	prizeId: string,
) {
	if (image.size > 5 * 1024 * 1024) {
		// 5MB
		throw new Error(`Image ${image.name} exceeds 5MB limit`);
	}

	const { error: uploadError } = await supabase.storage
		.from("prize-images")
		.upload(fileName, image);

	if (uploadError) {
		throw new Error(`Failed to upload prize image: ${uploadError.message}`);
	}

	const {
		data: { publicUrl },
	} = supabase.storage.from("prize-images").getPublicUrl(fileName);

	const { error: updateError } = await supabase
		.from("prizes")
		.update({ image_url: publicUrl })
		.eq("id", prizeId);

	if (updateError) {
		throw new Error(`Failed to update prize image URL: ${updateError.message}`);
	}
}

export async function POST(request: NextRequest) {
	try {
		const supabase = await createClient();

		// Check if user is authenticated
		const {
			data: { session },
		} = await supabase.auth.getSession();
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Parse FormData
		const formData = await request.formData();

		// Extract basic event data
		const name = formData.get("name") as string;
		const description = formData.get("description") as string;
		const startDateStr = formData.get("start_date") as string;
		const endDateStr = formData.get("end_date") as string;
		const prizesJson = formData.get("prizes") as string;

		// Validate required fields
		if (!name || !startDateStr || !endDateStr || !prizesJson) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		// Parse prizes data
		const prizes: PrizeInput[] = JSON.parse(prizesJson);

		if (!Array.isArray(prizes)) {
			return NextResponse.json(
				{ error: "Invalid prizes data" },
				{ status: 400 },
			);
		}

		// Convert string dates to Date objects
		const startDate = new Date(startDateStr);
		const endDate = new Date(endDateStr);

		// Check for date overlap
		const { hasOverlap, eventName } = await checkDateOverlap(
			startDate,
			endDate,
		);
		if (hasOverlap && eventName) {
			// Format dates for display
			const formattedStartDate = new Date(startDate).toLocaleDateString(
				"en-IN",
				{
					day: "numeric",
					month: "long",
					year: "numeric",
					timeZone: "Asia/Kolkata",
				},
			);

			const formattedEndDate = new Date(endDate).toLocaleDateString("en-IN", {
				day: "numeric",
				month: "long",
				year: "numeric",
				timeZone: "Asia/Kolkata",
			});

			return NextResponse.json(
				{
					error: `Event dates overlap with existing event "${eventName}" (${formattedStartDate} to ${formattedEndDate}). Please choose different dates.`,
				},
				{ status: 409 },
			);
		}

		// Use the create_event_with_prizes RPC function
		const { data: result, error: createError } = await supabase.rpc(
			"create_event_with_prizes",
			{
				event_data: {
					name,
					description: description || "",
					start_date: startDate.toISOString(),
					end_date: endDate.toISOString(),
					created_by_admin: session.user.email,
				},
				prizes_data: prizes.map((prize, index) => ({
					name: prize.name,
					description: prize.description || "",
					seniority_index: prize.seniority_index || index,
					image_url: null,
				})),
			},
		);

		if (createError) {
			return NextResponse.json(
				{
					error: `Failed to create event: ${createError.message}`,
				},
				{ status: 500 },
			);
		}

		if (!result || !result.event_id || !result.prize_ids) {
			return NextResponse.json(
				{
					error: "Invalid response from create_event_with_prizes",
				},
				{ status: 500 },
			);
		}

		const eventId = result.event_id;
		const prizeIds = result.prize_ids;

		// Handle image uploads if present
		try {
			// Process each prize image
			for (let i = 0; i < prizes.length; i++) {
				const prizeId = prizeIds[i];
				const imageFile = formData.get(`prize_image_${i}`) as File | null;

				if (!prizeId) {
					console.error(`Missing prize ID for index ${i}`);
					continue;
				}

				if (imageFile && imageFile instanceof File) {
					const fileName = `${eventId}/${prizeId}/${imageFile.name}`;
					await handlePrizeImageUpload(supabase, imageFile, fileName, prizeId);
				}
			}
		} catch (uploadError) {
			console.error("Error uploading prize images:", uploadError);
			// We don't fail the entire request if image upload fails
			// The event is already created, just log the error
		}

		return NextResponse.json({
			success: true,
			eventId: result.event_id,
		});
	} catch (error) {
		console.error("Error creating event:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: "An unexpected error occurred",
			},
			{ status: 500 },
		);
	}
}
