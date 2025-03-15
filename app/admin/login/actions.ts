'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginState = {
  error: string | null;
};

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  try {
    // Validate input
    const validatedFields = loginSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    // Attempt to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: validatedFields.email,
      password: validatedFields.password,
    });

    if (signInError) {
      return { error: 'Invalid credentials' };
    }

    // Check if user is an admin
    const { data: profile } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('email', validatedFields.email)
      .single();

    if (!profile) {
      // Sign out if not an admin
      await supabase.auth.signOut();
      return { error: 'Unauthorized access' };
    }

    redirect('/admin/dashboard');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }

    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: 'An unexpected error occurred' };
  }
} 