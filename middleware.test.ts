import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const getClaimsMock = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: { getClaims: getClaimsMock }
  })
}));

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
});

async function callMiddleware(url: string) {
  const request = new NextRequest(new URL(url, "http://localhost:3000"));
  const { middleware } = await import("./middleware");
  return middleware(request);
}

function stubClaims(sub: string | null) {
  getClaimsMock.mockResolvedValue({ data: sub ? { claims: { sub } } : null });
}

describe("middleware auth gate", () => {
  it("redirects unauthenticated /mypage requests to /login with next param", async () => {
    stubClaims(null);

    const response = await callMiddleware("/mypage");

    expect(response.status).toBe(307);
    const location = response.headers.get("location") ?? "";
    expect(location).toContain("/login");
    expect(location).toContain("next=%2Fmypage");
  });

  it("redirects unauthenticated /mypage/scores/:id with the full next path", async () => {
    stubClaims(null);

    const response = await callMiddleware("/mypage/scores/t1?round=2");

    const location = response.headers.get("location") ?? "";
    expect(response.status).toBe(307);
    expect(location).toContain("/login");
    expect(location).toContain("next=%2Fmypage%2Fscores%2Ft1%3Fround%3D2");
  });

  it("redirects unauthenticated /admin sub-paths to /admin?next=...", async () => {
    stubClaims(null);

    const response = await callMiddleware("/admin/members");

    expect(response.status).toBe(307);
    const location = response.headers.get("location") ?? "";
    expect(location).toContain("/admin?next=%2Fadmin%2Fmembers");
  });

  it("redirects unauthenticated /admin/members/[userId] to /admin?next=...", async () => {
    stubClaims(null);

    const response = await callMiddleware("/admin/members/user-1");

    const location = response.headers.get("location") ?? "";
    expect(response.status).toBe(307);
    expect(location).toContain("/admin?next=%2Fadmin%2Fmembers%2Fuser-1");
  });

  it("does NOT redirect /admin itself so the admin login form stays reachable", async () => {
    stubClaims(null);

    const response = await callMiddleware("/admin");

    expect(response.status).not.toBe(307);
    expect(response).toBeInstanceOf(NextResponse);
  });

  it("does NOT redirect /login, /signup, /reset-password", async () => {
    stubClaims(null);

    for (const path of ["/login", "/signup", "/reset-password"]) {
      const response = await callMiddleware(path);
      expect(response.status, `expected ${path} to pass through`).not.toBe(307);
    }
  });

  it("passes through /mypage and /admin/members when a Supabase session exists", async () => {
    stubClaims("user-1");

    for (const path of ["/mypage", "/admin/members", "/admin/members/user-1"]) {
      const response = await callMiddleware(path);
      expect(response.status, `expected ${path} to pass through`).not.toBe(307);
    }
  });
});
