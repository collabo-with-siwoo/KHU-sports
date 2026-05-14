import { headers } from "next/headers";

export async function getRequestIp() {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();

  return forwardedFor || headerStore.get("x-real-ip") || "unknown";
}
