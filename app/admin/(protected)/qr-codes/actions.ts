'use server';

import { createClient } from "@/utils/supabase/server";

export type QrCodeGroup = {
  created_at: string;
  created_by_admin: string;
  expires_at: string | null;
  total: number;
  used: number;
  unused: number;
};

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