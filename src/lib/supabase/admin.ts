import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase admin client with the service role key.
 * Use ONLY in server-side contexts (API routes, Server Actions).
 * Never expose the service role key to the client.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createSupabaseClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Safely checks if the current user has admin role.
 * Returns false if no session or role query fails.
 */
export async function isCurrentUserAdmin(supabase: ReturnType<typeof createSupabaseClient>): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { data } = await supabase
      .from("users")
      .select("role:roles(name)")
      .eq("id", user.id)
      .single();

    return (data as any)?.role?.name === "admin";
  } catch {
    return false;
  }
}
