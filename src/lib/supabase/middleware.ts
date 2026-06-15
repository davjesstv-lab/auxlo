import { createServerClient } from "@supabase/ssr";
import { type NextRequest, type NextResponse } from "next/server";
import { supabaseEnv } from "./config";

/**
 * Refreshes the Supabase auth session and writes any rotated cookies onto the
 * provided response. No-op when Supabase is not configured so that local
 * builds and demos work without credentials.
 */
export async function updateSession(
  request: NextRequest,
  response: NextResponse,
): Promise<NextResponse> {
  if (!supabaseEnv.isConfigured) return response;

  const supabase = createServerClient(supabaseEnv.url, supabaseEnv.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Touch the session so expired tokens are refreshed onto the response.
  await supabase.auth.getUser();

  return response;
}
