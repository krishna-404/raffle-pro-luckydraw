'use server';

import { createClient } from "@/utils/supabase/server";

export type Event = {
  id: string;
  created_by_admin: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  entry_count: number;
  prize_count: number;
  status: 'upcoming' | 'active' | 'ended';
};

export async function getEvents(): Promise<{ data: Event[]; total: number }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      entry_count:event_entries(count),
      prize_count:prizes(count)
    `)
    .order('start_date', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const now = new Date();
  const eventsWithStatus = data.map(event => ({
    ...event,
    entry_count: event.entry_count?.[0]?.count || 0,
    prize_count: event.prize_count?.[0]?.count || 0,
    status: new Date(event.start_date) > now 
      ? 'upcoming' 
      : new Date(event.end_date) < now 
        ? 'ended' 
        : 'active'
  }));

  return {
    data: eventsWithStatus,
    total: eventsWithStatus.length
  };
}

export async function deleteEvent(eventId: string) {
  const supabase = await createClient();
  
  // First check if event has entries
  const { count: entryCount } = await supabase
    .from('event_entries')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId);

  if (entryCount && entryCount > 0) {
    throw new Error(`Cannot delete event because it has ${entryCount} entries`);
  }

  // Delete all prizes associated with the event first
  const { error: prizeDeletionError } = await supabase
    .from('prizes')
    .delete()
    .eq('event_id', eventId);

  if (prizeDeletionError) {
    throw new Error('Failed to delete associated prizes');
  }

  // Now delete the event
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);

  if (error) {
    throw error;
  }
} 