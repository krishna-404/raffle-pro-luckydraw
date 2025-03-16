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
    .gte('end_date', new Date().toISOString())
    .lte('start_date', new Date().toISOString())
    .order('start_date', { ascending: false })
    .limit(1)
    .single();

  if (error || !events) {
    return null;
  }

  return events as ActiveEvent;
} 