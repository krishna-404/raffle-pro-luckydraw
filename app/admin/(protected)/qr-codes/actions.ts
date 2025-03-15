'use server';

import { createClient } from "@/utils/supabase/server";

export type QrCode = {
  id: string;
  created_by_admin: string;
  expires_at: string | null;
  created_at: string;
  status: 'unused' | 'used';
  entry?: {
    id: string;
    event_id: string;
    name: string;
  };
};

export type QrCodeFilters = {
  created_by?: string;
  status?: 'used' | 'unused';
  created_at_start?: string;
  created_at_end?: string;
  expires_at_start?: string;
  expires_at_end?: string;
};

export type SortBy = {
  column: 'created_at' | 'expires_at' | 'created_by_admin';
  order: 'asc' | 'desc';
};

export type QrCodeGroup = {
  created_at: string;
  created_by_admin: string;
  expires_at: string | null;
  total: number;
  used: number;
  unused: number;
};

export async function getQrCodes({
  page = 1,
  pageSize = 10,
  filters,
  sortBy,
}: {
  page?: number;
  pageSize?: number;
  filters?: QrCodeFilters;
  sortBy?: SortBy;
}) {
  const supabase = await createClient();

  // Start building the query
  let query = supabase
    .from('qr_codes')
    .select(`
      *,
      entry:event_entries(
        id,
        event_id,
        name
      )
    `, { count: 'exact' });

  // Apply filters
  if (filters) {
    if (filters.created_by) {
      query = query.eq('created_by_admin', filters.created_by);
    }
    if (filters.created_at_start) {
      query = query.gte('created_at', filters.created_at_start);
    }
    if (filters.created_at_end) {
      query = query.lte('created_at', filters.created_at_end);
    }
    if (filters.expires_at_start) {
      query = query.gte('expires_at', filters.expires_at_start);
    }
    if (filters.expires_at_end) {
      query = query.lte('expires_at', filters.expires_at_end);
    }
  }

  // Apply sorting
  if (sortBy) {
    query = query.order(sortBy.column, { ascending: sortBy.order === 'asc' });
  } else {
    // Default sorting by created_at desc
    query = query.order('created_at', { ascending: false });
  }

  // Apply pagination
  const start = (page - 1) * pageSize;
  query = query.range(start, start + pageSize - 1);

  // Execute query
  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  console.log({data});
  // Transform the data to include the status
  const qrCodes = data.map((qrCode: any) => ({
    ...qrCode,
    status: qrCode.entry.length ? 'used' : 'unused',
    entry: qrCode.entry?.[0], // Since it's a one-to-one relationship through event_entries
  }));

  return {
    data: qrCodes as QrCode[],
    total: count || 0,
    page,
    pageSize,
  };
}

export async function getQrCodeGroups(): Promise<{ data: QrCodeGroup[]; total: number }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc('get_qr_code_stats');

  if (error) {
    throw new Error(error.message);
  }

  const typedData = data as QrCodeGroup[];
  
  return {
    data: typedData,
    total: typedData.reduce((sum, group) => sum + group.total, 0)
  };
} 