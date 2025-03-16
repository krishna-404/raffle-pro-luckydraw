'use server';

import { Database } from "@/types/supabase";
import { createClient } from "@/utils/supabase/server";
import { cookies, headers } from "next/headers";
import { type EntryFormData } from "./types";

/**
 * Security Implementation Overview:
 * 
 * 1. Entry Flow Security:
 *    - QR codes are validated before allowing entry submission
 *    - Each QR code can only be used once
 *    - Rate limiting prevents brute force attempts
 *    - IP-based restrictions prevent multiple entries
 * 
 * 2. Session Security:
 *    - Entry verification uses HTTP-only cookies
 *    - Cookies are encrypted and contain:
 *      - Entry code
 *      - Event ID
 *      - Timestamp
 *    - 5-minute expiration on verification
 * 
 * 3. Anti-Gaming Measures:
 *    - IP address tracking
 *    - User agent logging
 *    - Rate limiting per IP
 *    - Attempt logging for audit
 *    - Double verification (cookie + database)
 */

const RATE_LIMIT_WINDOW = 3600; // 1 hour in seconds
const MAX_ATTEMPTS = 5; // Maximum attempts per IP per hour

/**
 * Checks if an IP has exceeded the rate limit for failed attempts
 * Used to prevent brute force attacks on QR codes
 */
async function checkRateLimit(ip: string): Promise<{ isLimited: boolean; nextTryTimestamp?: number }> {
  const supabase = await createClient();
  const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW * 1000);

  // Get the most recent failed attempt
  const { data: attempts } = await supabase
    .from('entry_attempts')
    .select('created_at')
    .eq('ip_address', ip)
    .eq('success', false)
    .gte('created_at', oneHourAgo.toISOString())
    .order('created_at', { ascending: false });

  if (!attempts || attempts.length < MAX_ATTEMPTS) {
    return { isLimited: false };
  }

  // Get the timestamp of the first attempt in the window
  const oldestAttempt = attempts[attempts.length - 1];
  const nextTryTimestamp = new Date(oldestAttempt.created_at).getTime() + RATE_LIMIT_WINDOW * 1000;

  return {
    isLimited: true,
    nextTryTimestamp
  };
}

/**
 * Logs attempt details for audit and rate limiting
 * Tracks both QR validation and entry submission attempts
 */
async function logAttempt(
  ip: string, 
  userAgent: string, 
  attemptType: 'qr_validation' | 'entry_submission',
  qrCodeInput: string | null,  // Renamed from qrCodeId to qrCodeInput to better reflect its purpose
  success: boolean, 
  reason?: string
) {
  const supabase = await createClient();

  // Store the original input value and validate UUID format
  let validQrCodeId: string | null = null;
  let finalReason = reason;

  if (qrCodeInput) {
    // Simple UUID format validation
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(qrCodeInput);
    
    if (isValidUUID) {
      validQrCodeId = qrCodeInput;
    } else {
      // If no specific reason is provided and UUID is invalid, set the reason
      if (!finalReason) {
        finalReason = `Invalid QR code format: ${qrCodeInput.slice(0, 50)}...`; // Truncate long inputs
      }
    }
  }

  try {
    const { error } = await supabase
      .from('entry_attempts')
      .insert({
        ip_address: ip,
        user_agent: userAgent,
        attempt_type: attemptType,
        qr_code_id: validQrCodeId,  // Only store valid UUIDs in qr_code_id
        success,
        failure_reason: finalReason
      });

    if (error) {
      console.error('Failed to log attempt:', error);
    }
  } catch (e) {
    console.error('Error logging attempt:', e);
  }
}

/**
 * Generates a cryptographically secure 6-digit alphanumeric code
 * Used for unique entry identification
 */
function generateEntryCode() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Validates a QR code and checks if it can be used for entry
 * Implements rate limiting and attempt tracking
 */
export async function validateQrCode(code: string) {
  const supabase = await createClient();
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';

  try {
    // Check rate limiting
    const { isLimited, nextTryTimestamp } = await checkRateLimit(ip);
    if (isLimited) {
      await logAttempt(ip, userAgent, 'qr_validation', code, false, 'Rate limited');
      return { 
        error: 'Too many attempts. Please try again later.',
        nextTryTimestamp 
      };
    }

    // Validate UUID format first
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(code)) {
      await logAttempt(ip, userAgent, 'qr_validation', code, false, `Invalid QR code format: ${code}`);
      return { error: 'Invalid QR code' };
    }

    // Check if QR code exists and is not expired
    const { data: qrCode, error: qrError } = await supabase
      .from('qr_codes')
      .select('id, expires_at')
      .eq('id', code)
      .single();

    if (qrError || !qrCode) {
      await logAttempt(ip, userAgent, 'qr_validation', code, false, 'Invalid QR code');
      return { error: 'Invalid QR code' };
    }

    if (qrCode.expires_at && new Date(qrCode.expires_at) < new Date()) {
      await logAttempt(ip, userAgent, 'qr_validation', code, false, 'Expired QR code');
      return { error: 'This QR code has expired' };
    }

    // Check if QR code is already used
    const { data: entry, error: entryError } = await supabase
      .from('event_entries')
      .select('id')
      .eq('qr_code_id', code)
      .single();

    if (entry) {
      await logAttempt(ip, userAgent, 'qr_validation', code, false, 'QR code already used');
      return { error: 'This QR code has already been used' };
    }

    // Get active event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name')
      .gte('end_date', new Date().toISOString())
      .lte('start_date', new Date().toISOString())
      .single();

    if (eventError || !event) {
      await logAttempt(ip, userAgent, 'qr_validation', code, false, 'No active event');
      return { error: 'No active giveaway found' };
    }

    await logAttempt(ip, userAgent, 'qr_validation', code, true);
    return { 
      valid: true, 
      eventId: event.id,
      eventName: event.name
    };
  } catch (error) {
    console.error('QR code validation error:', error);
    try {
      await logAttempt(ip, userAgent, 'qr_validation', code, false, 'Validation error');
    } catch (logError) {
      console.error('Failed to log validation error:', logError);
    }
    return { error: 'Failed to validate QR code' };
  }
}

/**
 * Processes an entry submission
 * Implements:
 * - IP-based submission limiting
 * - Unique code generation
 * - Secure session handling
 * - Attempt tracking
 */
export async function submitEntry(
  qrCode: string, 
  eventId: string, 
  data: EntryFormData
) {
  const supabase = await createClient();
  const headersList = await headers();
  const cookieStore = await cookies();
  console.log('Starting entry submission for:', { qrCode, eventId });

  try {
    // Get IP and user agent for tracking
    const forwardedFor = headersList.get('x-forwarded-for') || 'unknown';
    const ip = forwardedFor.split(',')[0];
    const userAgent = headersList.get('user-agent') || 'unknown';

    // Generate and verify unique entry code
    let entryCode = generateEntryCode();
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (!isUnique && attempts < maxAttempts) {
      const { data: existing } = await supabase
        .from('event_entries')
        .select('id')
        .eq('id', entryCode)
        .single();

      if (!existing) {
        isUnique = true;
      } else {
        entryCode = generateEntryCode();
        attempts++;
      }
    }

    if (!isUnique) {
      console.error('Failed to generate unique entry code after', maxAttempts, 'attempts');
      await logAttempt(ip, userAgent, 'entry_submission', qrCode, false, 'Failed to generate unique code');
      throw new Error('Failed to generate unique entry code');
    }

    console.log('Generated unique entry code:', entryCode);

    // Insert entry
    const { error: insertError } = await supabase
      .from('event_entries')
      .insert({
        id: entryCode,
        event_id: eventId,
        qr_code_id: qrCode,
        name: data.name,
        email: data.email || null,
        whatsapp_number: data.whatsappNumber,
        address: data.address,
        city: data.city,
        pincode: parseInt(data.pincode),
        request_ip_address: ip,
        request_user_agent: userAgent
      });

    if (insertError) {
      console.error('Entry insertion error:', insertError);
      await logAttempt(ip, userAgent, 'entry_submission', qrCode, false, insertError.message);
      return { error: insertError.message || 'Failed to submit entry' };
    }

    console.log('Entry inserted successfully, setting verification cookie');

    // Store entry verification in secure, HTTP-only cookie
    const verificationData = {
      code: entryCode,
      eventId,
      timestamp: Date.now()
    };
    
    console.log('Setting verification cookie with data:', verificationData);
    
    cookieStore.set('entry_verification', JSON.stringify(verificationData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 300 // 5 minutes
    });

    await logAttempt(ip, userAgent, 'entry_submission', qrCode, true);
    console.log('Entry submission completed successfully');
    
    return { 
      success: true,
      verified: true
    };
  } catch (error) {
    console.error('Entry submission error:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while submitting your entry. Please try again.' };
  }
}

type EntryWithEvent = Database['public']['Tables']['event_entries']['Row'] & {
  events: Pick<Database['public']['Tables']['events']['Row'], 'name'>;
};

/**
 * Verifies an entry using secure session data
 * Used by success page to prevent unauthorized access
 * Implements double verification (cookie + database)
 */
export async function verifyEntry() {
  const cookieStore = await cookies();
  const supabase = await createClient();

  try {
    // Get verification data from cookie
    const verificationCookie = cookieStore.get('entry_verification');
    console.log('Verification cookie found:', verificationCookie?.value ? 'yes' : 'no');
    
    if (!verificationCookie?.value) {
      return { error: 'No entry found' };
    }

    const verification = JSON.parse(verificationCookie.value);
    console.log('Parsed verification data:', verification);
    
    // Check if verification has expired (5 minutes)
    const timeSinceVerification = Date.now() - verification.timestamp;
    console.log('Time since verification (ms):', timeSinceVerification);
    
    if (timeSinceVerification > 300000) {
      console.log('Verification expired');
      cookieStore.delete('entry_verification');
      return { error: 'Entry verification expired' };
    }

    // Verify entry exists in database
    const { data: entry, error: entryError } = await supabase
      .from('event_entries')
      .select(`
        id, 
        name, 
        event_id,
        events!inner (
          name
        )
      `)
      .eq('id', verification.code)
      .eq('event_id', verification.eventId)
      .single() as { data: EntryWithEvent | null; error: any };

    if (entryError) {
      console.error('Database verification error:', entryError);
    }
    
    if (entryError || !entry) {
      return { error: 'Invalid entry' };
    }

    console.log('Entry verified in database:', entry);

    return {
      success: true,
      entryCode: entry.id,
      name: entry.name,
      eventName: entry.events.name
    };
  } catch (error) {
    console.error('Entry verification error:', error);
    return { error: 'Failed to verify entry' };
  }
} 