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
  const { data, error } = await supabase.rpc('get_qr_code_stats');

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
  console.log('DEBUG - QR Codes Batch Issue:');
  console.log('Input parameters:', { createdAt, createdByAdmin, expiresAt });
  
  const supabase = await createClient();

  // CRITICAL: Use the exact timestamp from the database for matching
  // We're using the exact createdAt value without any modification
  let query = supabase
    .from('qr_codes')
    .select('id, created_at, created_by_admin, expires_at')
    .eq('created_by_admin', createdByAdmin)
    .eq('created_at', createdAt); // Use exact timestamp matching
  
  // Only add the expires_at filter if it's not null
  if (expiresAt !== null) {
    query = query.eq('expires_at', expiresAt);
  } else {
    query = query.is('expires_at', null);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching QR codes:', error);
    throw new Error(`Failed to fetch QR codes: ${error.message}`);
  }

  console.log(`Retrieved ${data?.length || 0} QR codes with exact timestamp match`);
  
  // If no exact matches, log this information
  if (!data || data.length === 0) {
    console.log('WARNING: No QR codes found with exact timestamp match');
    console.log('Attempting to fetch all QR codes for this admin to debug');
    
    // Get all QR codes for this admin to debug
    const { data: allData, error: allError } = await supabase
      .from('qr_codes')
      .select('id, created_at, created_by_admin, expires_at')
      .eq('created_by_admin', createdByAdmin);
      
    if (allError) {
      console.error('Error fetching all QR codes:', allError);
    } else {
      console.log(`Found ${allData?.length || 0} total QR codes for this admin`);
      
      if (allData && allData.length > 0) {
        // Log a sample of timestamps to help debug
        console.log('Sample QR code timestamps:');
        allData.slice(0, 5).forEach((qr, i) => {
          console.log(`QR #${i}: ${qr.created_at}`);
        });
        
        // Log the timestamp we're trying to match (without any modification)
        console.log('Exact timestamp to match:', createdAt);
      }
    }
    
    return [];
  }
  
  // Log the successful matches
  console.log('Successfully matched QR codes:');
  data.slice(0, 3).forEach((qr, i) => {
    console.log(`Match #${i}: ${qr.created_at}`);
  });
  
  return data;
} 