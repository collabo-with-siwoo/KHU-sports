import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // M3 will replace this placeholder with Supabase-backed admin RBAC checks.
  return NextResponse.next({
    request
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
