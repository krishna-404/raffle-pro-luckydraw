'use server';

import { createClient } from "@/utils/supabase/server";

type GenerateQrCodesData = {
  count: number;
  expiresAt?: Date;
};

export async function generateQrCodes(data: GenerateQrCodesData) {
  const supabase = await createClient();

  // Get current user's email
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.email) {
    throw new Error('Not authenticated');
  }

  // Generate QR codes
  const qrCodes = Array.from({ length: data.count }, () => ({
    created_by_admin: user.email,
    expires_at: data.expiresAt?.toISOString() || null,
  }));

  const { error } = await supabase
    .from('qr_codes')
    .insert(qrCodes);

  if (error) {
    console.error('Error generating QR codes:', error);
    throw new Error(`Failed to generate QR codes: ${error.message}`);
  }
} 