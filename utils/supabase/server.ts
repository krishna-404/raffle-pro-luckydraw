import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
	const cookieStore = await cookies();

	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL || "",
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookiesToSet) {
					try {
						for (const { name, value, options } of cookiesToSet) {
							cookieStore.set(name, value, options);
						}
					} catch (error) {
						// The `set` method was called from a Server Component.
						// This can be ignored if you have middleware refreshing
						// user sessions.
					}
				},
			},
		},
	);
};

/**
 * Creates a Supabase client with service role privileges
 * This client bypasses RLS policies and should only be used
 * for server-side operations that require elevated privileges
 */
export const createServiceRoleClient = async () => {
	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL || "",
		process.env.SUPABASE_SERVICE_ROLE_KEY || "",
		{
			// No cookies needed for service role client
			cookies: {
				getAll: () => [],
				setAll: () => {},
			},
		},
	);
};
