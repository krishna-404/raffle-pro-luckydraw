'use server';

import { createClient } from "@/utils/supabase/server";

export type Prize = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  seniority_index: number;
};

export type ActiveEvent = {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  prizes: Prize[];
};

export async function getActiveEvent(): Promise<ActiveEvent | null> {
  const supabase = await createClient();
  
  const now = new Date();
  
  const { data: events, error } = await supabase
    .from('events')
    .select(`
      *,
      prizes (
        id,
        name,
        description,
        image_url,
        seniority_index
      )
    `)
    .gte('end_date', now.toISOString().split('T')[0]) // Compare only the date part
    .lte('start_date', now.toISOString().split('T')[0])
    .order('start_date', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return null;
  }

  return events as ActiveEvent;
} 