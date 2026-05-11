import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CurrentMember = {
  id: string;
  username: string;
  email: string;
  name: string;
  userType: "GENERAL" | "PLAYER";
  status: "ACTIVE" | "DORMANT" | "WITHDRAWN_PENDING" | "WITHDRAWN_DELETED";
  lastLoginAt: Date | null;
};

export async function getCurrentMember(): Promise<CurrentMember | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      return null;
    }

    return prisma.user.findUnique({
      where: { id: data.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        userType: true,
        status: true,
        lastLoginAt: true
      }
    });
  } catch {
    return null;
  }
}
