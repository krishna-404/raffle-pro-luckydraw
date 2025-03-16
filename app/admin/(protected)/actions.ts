'use server';

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export type RecentEntry = {
  id: string;
  name: string;
  event_name: string;
  created_at: string;
};

export type DashboardStats = {
  totalQrCodes: number;
  totalEvents: number;
  totalEntries: number;
  totalWinners: number;
  recentEntries: RecentEntry[];
  monthlyStats: {
    month: string;
    qrCodes: number;
    events: number;
    entries: number;
    winners: number;
  }[];
};

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  // Get total counts
  const [qrCodesCount, eventsCount, entriesCount, winnersCount] = await Promise.all([
    supabase.from('qr_codes').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('event_entries').select('*', { count: 'exact', head: true }),
    supabase.from('event_entries').select('*', { count: 'exact', head: true }).not('prize_id', 'is', null),
  ]);

  // Get recent entries
  const { data: recentEntriesData, error: recentEntriesError } = await supabase
    .from('event_entries')
    .select(`
      id,
      name,
      created_at,
      events:event_id (name)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  if (recentEntriesError) {
    console.error('Error fetching recent entries:', recentEntriesError);
  }

  const recentEntries = (recentEntriesData || []).map((entry: any) => ({
    id: entry.id,
    name: entry.name,
    event_name: entry.events?.name || 'Unknown Event',
    created_at: entry.created_at,
  }));

  // Get monthly stats for the last 6 months
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [qrCodesData, eventsData, entriesData, winnersData] = await Promise.all([
    supabase
      .from('qr_codes')
      .select('created_at')
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at'),
    supabase
      .from('events')
      .select('created_at')
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at'),
    supabase
      .from('event_entries')
      .select('created_at')
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at'),
    supabase
      .from('event_entries')
      .select('created_at')
      .not('prize_id', 'is', null)
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at'),
  ]);

  // Process monthly stats
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return d.toLocaleString('default', { month: 'short' });
  }).reverse();

  const monthlyData = months.map(month => ({
    month,
    qrCodes: 0,
    events: 0,
    entries: 0,
    winners: 0,
  }));

  // Helper function to count items per month
  const countByMonth = (data: Array<{ created_at: string }> | null, monthIndex: number) => {
    if (!data) return 0;
    return data.filter(item => {
      const itemDate = new Date(item.created_at);
      return itemDate.getMonth() === now.getMonth() - (5 - monthIndex);
    }).length;
  };

  // Fill in the monthly counts
  monthlyData.forEach((item, index) => {
    item.qrCodes = countByMonth(qrCodesData.data, index);
    item.events = countByMonth(eventsData.data, index);
    item.entries = countByMonth(entriesData.data, index);
    item.winners = countByMonth(winnersData.data, index);
  });

  return {
    totalQrCodes: qrCodesCount.count || 0,
    totalEvents: eventsCount.count || 0,
    totalEntries: entriesCount.count || 0,
    totalWinners: winnersCount.count || 0,
    recentEntries,
    monthlyStats: monthlyData,
  };
} 