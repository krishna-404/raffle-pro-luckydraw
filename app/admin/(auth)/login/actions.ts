'use server';

import { LoginFormData } from '@/app/admin/(auth)/login/page';
import { createClient } from '@/utils/supabase/server';

export async function loginAction(data: LoginFormData): Promise<{ error: string | null; success?: boolean }> {
  const supabase = await createClient();

  try {
    // Attempt to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (signInError) {
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
      // Sign out if not an admin
      await supabase.auth.signOut();
      return { error: 'Unauthorized access' };
    }

    return { error: null, success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred' };
  }
} 