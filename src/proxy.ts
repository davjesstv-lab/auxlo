import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

// Next 16 "proxy" convention (formerly "middleware"). Runs before routes are
// rendered.
export async function proxy(request: NextRequest) {
  // First resolve the locale routing, then refresh the Supabase auth session
  // on the response so cookies stay valid. updateSession is a no-op when
  // Supabase is not yet configured (e.g. local build without env vars).
  const response = intlMiddleware(request);
  return updateSession(request, response);
}

export const config = {
  // Run on everything except Next internals and static files.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
