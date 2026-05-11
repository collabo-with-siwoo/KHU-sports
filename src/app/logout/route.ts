import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { APP_SESSION_COOKIE_NAME, getAppSessionCookieOptions } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  redirect("/");
}

export async function POST() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  const cookieStore = await cookies();
  cookieStore.set(APP_SESSION_COOKIE_NAME, "", {
    ...getAppSessionCookieOptions(),
    maxAge: 0
  });
  redirect("/");
}
