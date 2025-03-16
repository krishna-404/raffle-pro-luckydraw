'use server';

import { checkRateLimit, logAttempt } from '@/utils/auth-attempts';
import { createClient } from '@/utils/supabase/server';
import { type LoginFormData } from './types';

export async function loginAction(data: LoginFormData): Promise<{ error: string | null; success?: boolean }> {
  const supabase = await createClient();

  try {
    // Check rate limit and get request info
    const { ip, userAgent } = await checkRateLimit('login');

    // Attempt to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (signInError) {
      // Log failed attempt
      await logAttempt({
        actionType: 'login',
        ip,
        userAgent,
        success: false,
        failureReason: signInError.code === "email_not_confirmed" 
          ? 'Email not confirmed'
          : 'Invalid credentials'
      });

      if(signInError.code === "email_not_confirmed") {
        return { error: 'Please confirm your email address' };
      }
      return { error: 'Invalid credentials' };
    }

    // Check if user is an admin
    const { data: profile } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', data.email)
      .single();

    if (!profile) {
      // Sign out if not an admin and log attempt
      await supabase.auth.signOut();
      await logAttempt({
        actionType: 'login',
        ip,
        userAgent,
        success: false,
        failureReason: 'Unauthorized access - Not an admin'
      });
      return { error: 'Unauthorized access' };
    }

    // Log successful attempt
    await logAttempt({
      actionType: 'login',
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
        const { ip, userAgent } = await checkRateLimit('login');
        await logAttempt({
          actionType: 'login',
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