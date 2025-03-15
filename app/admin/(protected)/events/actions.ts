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
  status: 'upcoming' | 'active' | 'ended';
};

export async function getEvents(): Promise<{ data: Event[]; total: number }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      entry_count:event_entries(count)
    `)
    .order('start_date', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const now = new Date();
  const eventsWithStatus = data.map(event => ({
    ...event,
    entry_count: event.entry_count || 0,
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