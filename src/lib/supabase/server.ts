import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseEnv } from "./config";

/**
 * Server-side Supabase client for Server Components, Route Handlers, and
 * Server Actions. Reads and writes auth cookies via the Next.js cookie store.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseEnv.url, supabaseEnv.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component where cookies are read-only.
          // Session refresh is handled in middleware, so this is safe to ignore.
        }
      },
    },
  });
}

/**
 * Returns the currently authenticated user, or null when there is no session
 * or Supabase is not configured. Guards client creation so unconfigured
 * builds never throw.
 */
export async function getUser() {
  if (!supabaseEnv.isConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
