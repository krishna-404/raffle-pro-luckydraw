import { createClient } from '@/utils/supabase/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    // Only protect admin routes
    if (!request.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.next();
    }

    // Don't protect login page
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    const response = NextResponse.next();

    // Create a Supabase client
    const supabase = createClient(request);

    // Check if we have a session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Check if user is an admin
    const { data: profile } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('email', session.user.email)
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
