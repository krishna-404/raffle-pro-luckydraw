import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

export const MAX_FAILED_ATTEMPTS = 5;
export type AuthActionType = 'login' | 'registration';

export async function checkRateLimit(actionType: AuthActionType) {
  const supabase = await createClient();
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for') ?? '';
  const ip = forwardedFor.split(',')[0] || 'unknown';
  const userAgent = headersList.get('user-agent') ?? 'unknown';

  // Get recent failed attempts using database time
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const { data: recentAttempts, error: attemptsError } = await supabase
    .from('auth_attempts')
    .select('*')
    .eq('ip_address', ip)
    .eq('action_type', actionType)
    .eq('success', false)
    .gte('created_at', oneHourAgo.toISOString())
    .limit(MAX_FAILED_ATTEMPTS);

  if (attemptsError) {
    console.error('Error checking auth attempts:', attemptsError);
    throw new Error('Unable to process request');
  }

  // Check if too many failed attempts
  if (recentAttempts && recentAttempts.length >= MAX_FAILED_ATTEMPTS) {
    await logAttempt({
      actionType,
      ip,
      userAgent,
      success: false,
      failureReason: 'Too many failed attempts'
    });
    throw new Error('Too many failed attempts. Please try again later.');
  }

  return { ip, userAgent };
}

type LogAttemptParams = {
  actionType: AuthActionType;
  ip: string;
  userAgent: string;
  success: boolean;
  failureReason?: string | null;
};

export async function logAttempt({
  actionType,
  ip,
  userAgent,
  success,
  failureReason
}: LogAttemptParams) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('auth_attempts')
    .insert({ 
      ip_address: ip,
      user_agent: userAgent,
      action_type: actionType,
      success,
      failure_reason: failureReason
    });

  if (error) {
    console.error('Failed to log auth attempt:', error);
  }
} 