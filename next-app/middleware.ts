import { createClient } from "./utils/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Redirect old staff/vendor login routes to unified login
  if (request.nextUrl.pathname === "/staff/login" || request.nextUrl.pathname === "/vendor/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return createClient(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
