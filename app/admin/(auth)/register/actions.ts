'use server';

import { checkRateLimit, logAttempt } from '@/utils/auth-attempts';
import { createClient } from '@/utils/supabase/server';
import { type RegisterFormData } from './types';

export async function registerAction(data: RegisterFormData): Promise<{ error: string | null; success?: boolean }> {
  const supabase = await createClient();

  try {
    // Check rate limit and get request info
    const { ip, userAgent } = await checkRateLimit('registration');

    // Validate registration token
    if (data.token !== process.env.ADMIN_REGISTRATION_TOKEN) {
      await logAttempt({
        actionType: 'registration',
        ip,
        userAgent,
        success: false,
        failureReason: 'Invalid registration token'
      });
      return { error: 'Invalid registration token' };
    }

    // Attempt to sign up
    const { error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (signUpError) {
      await logAttempt({
        actionType: 'registration',
        ip,
        userAgent,
        success: false,
        failureReason: signUpError.message
      });
      return { error: signUpError.message };
    }

    // Log successful attempt
    await logAttempt({
      actionType: 'registration',
      ip,
      userAgent,
      success: true
    });

    return { error: null, success: true };
  } catch (error) {
    if (error instanceof Error) {
      // If it's a rate limit error, return it directly
      if (error.message.includes('Too many failed attempts')) {
        return { error: error.message };
      }

      // For other errors, log the attempt
      try {
        const { ip, userAgent } = await checkRateLimit('registration');
        await logAttempt({
          actionType: 'registration',
          ip,
          userAgent,
          success: false,
          failureReason: error.message
        });
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }

      return { error: error.message };
    }
    return { error: 'An unexpected error occurred' };
  }
} 