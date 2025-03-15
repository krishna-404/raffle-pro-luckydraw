'use server';

import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';
import { type RegisterFormData } from './types';

const MAX_FAILED_ATTEMPTS = 5;

export async function registerAction(data: RegisterFormData): Promise<{ error: string | null; success?: boolean }> {
  const headersList = await headers();
  const supabase = await createClient();

  try {
    // Get IP address and user agent
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    // Get recent failed attempts using database time
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const { data: recentAttempts, error: attemptsError } = await supabase
      .from('registration_attempts')
      .select('*')
      .eq('ip_address', ip)
      .eq('success', false)
      .gte('created_at', oneHourAgo.toISOString())
      .limit(MAX_FAILED_ATTEMPTS);

    console.log({attemptsError});
    if (attemptsError) {
      console.error('Error checking registration attempts:', attemptsError);
      return { error: 'Unable to process registration' };
    }

    // Check if too many failed attempts
    if (recentAttempts && recentAttempts.length >= MAX_FAILED_ATTEMPTS) {
      await supabase
        .from('registration_attempts')
        .insert({ 
          ip_address: ip, 
          user_agent: userAgent, 
          success: false,
          failure_reason: 'Too many failed attempts'
        });
      return { error: 'Too many failed attempts. Please try again later.' };
    }

    // Validate registration token
    if (data.token !== process.env.ADMIN_REGISTRATION_TOKEN) {
      await supabase
        .from('registration_attempts')
        .insert({ 
          ip_address: ip, 
          user_agent: userAgent, 
          success: false,
          failure_reason: 'Invalid registration token'
        });
      return { error: 'Invalid registration token' };
    }

    console.log({data});
    // Attempt to sign up
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    console.log('signUpError', signUpError);
    if (signUpError) {
      await supabase
        .from('registration_attempts')
        .insert({ 
          ip_address: ip, 
          user_agent: userAgent, 
          success: false,
          failure_reason: signUpError.message
        });
      return { error: signUpError.message };
    }

    // Log the successful attempt
    await supabase
      .from('registration_attempts')
      .insert({ 
        ip_address: ip, 
        user_agent: userAgent, 
        success: true,
        failure_reason: null
      });

    return { error: null, success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred' };
  }
} 