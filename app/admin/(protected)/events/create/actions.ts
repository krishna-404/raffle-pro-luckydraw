'use server';

import { createClient } from "@/utils/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

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

async function handlePrizeImageUpload(
  supabase: SupabaseClient,
  image: File,
  fileName: string,
  prizeId: string
) {
  if (image.size > 5 * 1024 * 1024) { // 5MB
    throw new Error(`Image ${image.name} exceeds 5MB limit`);
  }

  const { error: uploadError } = await supabase.storage
    .from('prize-images')
    .upload(fileName, image);

  if (uploadError) {
    throw new Error(`Failed to upload prize image: ${uploadError.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('prize-images')
    .getPublicUrl(fileName);

  const { error: updateError } = await supabase
    .from('prizes')
    .update({ image_url: publicUrl })
    .eq('id', prizeId);

  if (updateError) {
    throw new Error(`Failed to update prize image URL: ${updateError.message}`);
  }
}

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
export async function checkDateOverlap(start_date: Date, end_date: Date): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .select('id')
    .or(
      // First condition checks scenarios 1, 2, and 3:
      // - If existing event's start date is before/on new event's end date AND
      // - If existing event's end date is after/on new event's start date
      // This catches any kind of overlap where dates intersect
      `and(start_date.lte.${end_date.toISOString()},end_date.gte.${start_date.toISOString()}),` +
      // Second condition checks scenario 4:
      // - If existing event's start date is after/on new event's start date AND
      // - If existing event's end date is before/on new event's end date
      // This catches when new event completely contains an existing event
      `and(start_date.gte.${start_date.toISOString()},end_date.lte.${end_date.toISOString()})`
    );

  if (error) {
    throw new Error(`Failed to check date overlap: ${error.message}`);
  }

  // If any events match our conditions, we have an overlap
  return data.length > 0;
}

export async function createEvent(data: CreateEventData) {
  try {
    const supabase = await createClient();

    // Get current user's email
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.email) {
      throw new Error('Not authenticated');
    }

    // Check for date overlap
    const hasOverlap = await checkDateOverlap(data.start_date, data.end_date);
    if (hasOverlap) {
      throw new Error('Event dates overlap with an existing event');
    }

    // Use the create_event_with_prizes RPC function
    const { data: result, error: createError } = await supabase.rpc('create_event_with_prizes', {
      event_data: {
        name: data.name,
        description: data.description,
        start_date: data.start_date.toISOString(),
        end_date: data.end_date.toISOString(),
        created_by_admin: user.email
      },
      prizes_data: data.prizes.map((prize, index) => ({
        name: prize.name,
        description: prize.description,
        seniority_index: index,
        image_url: null
      }))
    });

    if (createError) {
      throw new Error(`Failed to create event: ${createError.message}`);
    }

    console.log('RPC Result:', result); // Debug log

    if (!result || !result.event_id || !result.prize_ids) {
      throw new Error('Invalid response from create_event_with_prizes');
    }

    const eventId = result.event_id;
    const prizeIds = result.prize_ids;

    if (!Array.isArray(prizeIds) || prizeIds.length !== data.prizes.length) {
      throw new Error('Mismatch between prizes and returned prize IDs');
    }

    // Handle image uploads after successful transaction
    for (let i = 0; i < data.prizes.length; i++) {
      const prize = data.prizes[i];
      const prizeId = prizeIds[i];

      if (!prizeId) {
        console.error(`Missing prize ID for index ${i}`);
        continue;
      }

      if (prize.image) {
        const fileName = `${eventId}/${prizeId}/${prize.image.name}`;
        await handlePrizeImageUpload(supabase, prize.image, fileName, prizeId);
      }
    }

    revalidatePath('/admin/events');
    return { eventId };
  } catch (error) {
    // Ensure error is properly propagated
    throw error instanceof Error 
      ? error 
      : new Error('Failed to create event');
  }
} 