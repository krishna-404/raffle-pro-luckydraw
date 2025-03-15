import { createClient } from '@/utils/supabase/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    // Only protect admin routes
    if (!request.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.next();
    }

    // Don't protect login and register pages
    if (request.nextUrl.pathname === '/admin/login' || request.nextUrl.pathname === '/admin/register') {
      return NextResponse.next();
    }

    const response = NextResponse.next();

    // Create a Supabase client
    const supabase = createClient(request);

    // Check if we have a valid user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Check if user is an admin
    const { data: profile } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', user.email)
      .single();

    if (!profile) {
      // Sign out if not an admin
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return response;
  } catch (e) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};
