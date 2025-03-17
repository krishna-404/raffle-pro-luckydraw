"use server";

import { createClient } from "@/utils/supabase/server";

// We keep the Prize type for reference and potential future use
export type Prize = {
	name: string;
	description: string;
	image: File | null;
	seniority_index: number;
};

export type CreateEventData = {
	name: string;
	description: string;
	start_date: Date;
	end_date: Date;
	prizes: Prize[];
};

/**
 * Checks if a new event's dates overlap with any existing events
 *
 * Overlap scenarios:
 * 1. New event overlaps with start of existing event
 *    Existing: |-------|
 *    New:    |-------|
 *
 * 2. New event overlaps with end of existing event
 *    Existing: |-------|
 *    New:        |-------|
 *
 * 3. New event is completely within existing event
 *    Existing: |----------|
 *    New:        |-----|
 *
 * 4. New event completely encompasses existing event
 *    Existing:    |--|
 *    New:      |-------|
 *
 * 5. Exact date match
 *    Existing: |-------|
 *    New:      |-------|
 */
export async function checkDateOverlap(
	start_date: Date,
	end_date: Date,
): Promise<{ hasOverlap: boolean; eventName?: string }> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("events")
		.select("name")
		.or(
			`and(start_date.lte.${end_date.toISOString()},end_date.gte.${start_date.toISOString()}),` +
				`and(start_date.gte.${start_date.toISOString()},end_date.lte.${end_date.toISOString()})`,
		);

	if (error) {
		throw new Error(`Failed to check date overlap: ${error.message}`);
	}

	// Check if we have any overlapping events
	const hasOverlappingEvent = data && data.length > 0;

	return {
		hasOverlap: hasOverlappingEvent,
		eventName: hasOverlappingEvent ? data[0].name : undefined,
	};
}
