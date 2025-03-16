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

export type QrCode = {
  id: string;
  created_at: string;
  created_by_admin: string;
  expires_at: string | null;
};

export async function getQrCodesByGroup(
  createdAt: string,
  createdByAdmin: string,
  expiresAt: string | null
): Promise<QrCode[]> {
  console.log('=== GET QR CODES BY GROUP START ===');
  console.log('Parameters:', { createdAt, createdByAdmin, expiresAt });
  
  const supabase = await createClient();
  console.log('Supabase client created');

  // Convert the date strings to ISO format for comparison
  const createdAtDate = new Date(createdAt);
  const startOfDay = new Date(createdAtDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(createdAtDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  console.log('Date range:', {
    startOfDay: startOfDay.toISOString(),
    endOfDay: endOfDay.toISOString()
  });

  // Build the query
  console.log('Building database query...');
  let query = supabase
    .from('qr_codes')
    .select('id, created_at, created_by_admin, expires_at')
    .eq('created_by_admin', createdByAdmin)
    .gte('created_at', startOfDay.toISOString())
    .lte('created_at', endOfDay.toISOString());
  
  // Only add the expires_at filter if it's not null
  if (expiresAt !== null) {
    console.log(`Adding expires_at filter with value: ${expiresAt}`);
    query = query.eq('expires_at', expiresAt);
  } else {
    console.log('Adding expires_at IS NULL filter');
    query = query.is('expires_at', null);
  }

  console.log('Executing database query...');
  const { data, error } = await query;

  if (error) {
    console.error('Error fetching QR codes:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    console.log('=== GET QR CODES BY GROUP END (WITH ERROR) ===');
    throw new Error(`Failed to fetch QR codes: ${error.message}`);
  }

  console.log(`Query successful, received ${data?.length || 0} QR codes`);
  
  // Log a sample of the results
  if (data && data.length > 0) {
    console.log('Sample of first 2 QR codes:');
    data.slice(0, 2).forEach((qr, i) => {
      console.log(`QR #${i}: id=${qr.id?.substring(0, 8)}...`);
    });
  } else {
    console.log('No QR codes found matching the criteria');
  }
  
  console.log('=== GET QR CODES BY GROUP END ===');
  return data as QrCode[];
} 