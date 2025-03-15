'use server';

import { type RegisterFormData } from '@/app/admin/(auth)/register/page';
import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';

export async function registerAction(data: RegisterFormData): Promise<{ error: string | null; success?: boolean }> {
  const headersList = await headers();
  const supabase = await createClient();

  try {
    // Get IP address from X-Forwarded-For header
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';

    // Validate registration token
    if (data.token !== process.env.ADMIN_REGISTRATION_TOKEN) {
      return { error: 'Invalid registration token' };
    }

    // Check registration attempts
    const { data: attempts, error: attemptsError } = await supabase
      .from('registration_attempts')
      .select('*')
      .eq('ip_address', ip)
      .single();

    console.log({ attempts, attemptsError });

    if (attemptsError && attemptsError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      return { error: 'Error checking registration attempts' };
    }

    // If IP is blocked, reject registration
    if (attempts?.is_blocked) {
      return { error: 'Registration blocked due to too many attempts' };
    }

    // Get current timestamp
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // If attempts exist and last attempt was within 24 hours
    if (attempts && new Date(attempts.last_attempt) > twentyFourHoursAgo) {
      // If too many attempts, block the IP
      if (attempts.attempt_count >= 2) {
        await supabase
          .from('registration_attempts')
          .update({ is_blocked: true })
          .eq('ip_address', ip);
        return { error: 'Too many registration attempts. Your IP has been blocked.' };
      }

      // Increment attempt count
      await supabase
        .from('registration_attempts')
        .update({
          attempt_count: attempts.attempt_count + 1,
          last_attempt: now.toISOString(),
        })
        .eq('ip_address', ip);
    } else {
      // Create new attempt record
      await supabase
        .from('registration_attempts')
        .upsert({
          ip_address: ip,
          attempt_count: 1,
          last_attempt: now.toISOString(),
          is_blocked: false,
        });
    }

    console.log({data});
    // Attempt to sign up
    const { error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (signUpError) {
      return { error: signUpError.message };
    }

    return { error: null, success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred' };
  }
} 