import { beforeEach, describe, expect, it, vi } from "vitest";
import { requestWithdrawalAction } from "./actions";
import { getCurrentMember } from "@/lib/members";
import { requestMemberWithdrawal } from "@/lib/member-lifecycle";

const redirectMock = vi.fn((url: string) => {
  throw new Error(`__REDIRECT__:${url}`);
});

vi.mock("next/navigation", () => ({
  redirect: (url: string) => redirectMock(url)
}));

const cookieSet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ set: cookieSet })
}));

const signOutMock = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: () => Promise.resolve({ auth: { signOut: signOutMock } })
}));

vi.mock("@/lib/members", () => ({
  getCurrentMember: vi.fn()
}));

vi.mock("@/lib/member-lifecycle", () => ({
  requestMemberWithdrawal: vi.fn()
}));

const getCurrentMemberMock = vi.mocked(getCurrentMember);
const requestMemberWithdrawalMock = vi.mocked(requestMemberWithdrawal);

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

function activeMember(overrides: Partial<NonNullable<Awaited<ReturnType<typeof getCurrentMember>>>> = {}) {
  return {
    id: "user-1",
    username: "u",
    email: "u@example.com",
    name: "U",
    userType: "GENERAL" as const,
    status: "ACTIVE" as const,
    lastLoginAt: null,
    ...overrides
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("requestWithdrawalAction", () => {
  it("rejects when the confirmation phrase is wrong", async () => {
    await expect(requestWithdrawalAction(formData({ confirmText: "탈퇴" }))).rejects.toThrow(
      "탈퇴 신청 문구를 정확히 입력해주세요."
    );
    expect(getCurrentMemberMock).not.toHaveBeenCalled();
    expect(requestMemberWithdrawalMock).not.toHaveBeenCalled();
  });

  it("redirects unauthenticated callers to /login regardless of form input", async () => {
    getCurrentMemberMock.mockResolvedValue(null);

    await expect(requestWithdrawalAction(formData({ confirmText: "탈퇴 신청" }))).rejects.toThrow(
      "__REDIRECT__:/login?next=%2Fmypage"
    );
    expect(requestMemberWithdrawalMock).not.toHaveBeenCalled();
  });

  it("rejects non-ACTIVE members so the lifecycle can't be replayed", async () => {
    getCurrentMemberMock.mockResolvedValue(activeMember({ status: "WITHDRAWN_PENDING" }));

    await expect(requestWithdrawalAction(formData({ confirmText: "탈퇴 신청" }))).rejects.toThrow(
      /ACTIVE/
    );
    expect(requestMemberWithdrawalMock).not.toHaveBeenCalled();
  });

  it("invokes lifecycle with the session user id only", async () => {
    getCurrentMemberMock.mockResolvedValue(activeMember({ id: "session-user-1" }));

    await expect(requestWithdrawalAction(formData({ confirmText: "탈퇴 신청" }))).rejects.toThrow(
      "__REDIRECT__:/login?withdrawal=requested"
    );

    expect(requestMemberWithdrawalMock).toHaveBeenCalledExactlyOnceWith("session-user-1");
    expect(signOutMock).toHaveBeenCalledOnce();
    expect(cookieSet).toHaveBeenCalledWith(
      expect.stringMatching(/khu_app_session/i),
      "",
      expect.objectContaining({ maxAge: 0 })
    );
  });

  it("ignores any userId smuggled in the form payload", async () => {
    getCurrentMemberMock.mockResolvedValue(activeMember({ id: "session-user-2" }));

    await expect(
      requestWithdrawalAction(formData({ confirmText: "탈퇴 신청", userId: "victim-user" }))
    ).rejects.toThrow("__REDIRECT__:/login?withdrawal=requested");

    expect(requestMemberWithdrawalMock).toHaveBeenCalledExactlyOnceWith("session-user-2");
  });
});
