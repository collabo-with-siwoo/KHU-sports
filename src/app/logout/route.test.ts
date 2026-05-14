import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { POST } from "./route";

const redirectMock = vi.fn((url: string) => {
  throw new Error(`__REDIRECT__:${url}`);
});
const cookieSetMock = vi.fn();
const signOutMock = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: (url: string) => redirectMock(url)
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    set: cookieSetMock
  }))
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: {
      signOut: signOutMock
    }
  }))
}));

const createSupabaseServerClientMock = vi.mocked(createSupabaseServerClient);

function logoutRequest(headers?: HeadersInit) {
  return new Request("http://localhost:3000/logout", {
    method: "POST",
    headers
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /logout", () => {
  it("blocks explicit cross-site logout requests before sign-out", async () => {
    const response = await POST(
      logoutRequest({
        origin: "https://evil.example",
        "sec-fetch-site": "cross-site"
      })
    );

    expect(response.status).toBe(403);
    expect(createSupabaseServerClientMock).not.toHaveBeenCalled();
    expect(signOutMock).not.toHaveBeenCalled();
    expect(cookieSetMock).not.toHaveBeenCalled();
  });

  it("keeps same-origin logout behavior", async () => {
    await expect(
      POST(
        logoutRequest({
          origin: "http://localhost:3000",
          "sec-fetch-site": "same-origin"
        })
      )
    ).rejects.toThrow("__REDIRECT__:/");

    expect(signOutMock).toHaveBeenCalled();
    expect(cookieSetMock).toHaveBeenCalledWith(
      "khu_app_session_started_at",
      "",
      expect.objectContaining({ maxAge: 0 })
    );
  });
});
