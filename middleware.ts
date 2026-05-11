import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  APP_SESSION_COOKIE_NAME,
  getAppSessionCookieOptions
} from "@/lib/auth/session";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const { data } = await supabase.auth.getClaims();
  const hasUser = Boolean(data?.claims.sub);

  const sessionCookieOptions = getAppSessionCookieOptions();
  const hasAppSessionCookie = Boolean(request.cookies.get(APP_SESSION_COOKIE_NAME)?.value);

  if (hasUser && !hasAppSessionCookie) {
    const startedAt = String(Date.now());
    request.cookies.set(APP_SESSION_COOKIE_NAME, startedAt);
    response.cookies.set(APP_SESSION_COOKIE_NAME, startedAt, sessionCookieOptions);
  }

  if (!hasUser && hasAppSessionCookie) {
    response.cookies.set(APP_SESSION_COOKIE_NAME, "", {
      ...sessionCookieOptions,
      maxAge: 0
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/mypage/:path*",
    "/login",
    "/signup",
    "/reset-password",
    "/logout"
  ]
};
