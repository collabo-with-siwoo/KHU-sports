import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  finalizeMemberWithdrawalAction,
  recoverMemberAction,
  requestAdminStatusChangeAction,
  updateMemberTypeAction
} from "./actions";
import { requireAdminPermission } from "@/lib/admin/auth";
import {
  convertMemberToPlayer,
  demoteMemberToGeneral,
  finalizeWithdrawnMember,
  recoverPendingWithdrawal,
  setMemberOperationalStatus
} from "@/lib/member-lifecycle";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

vi.mock("@/lib/admin/auth", () => ({
  requireAdminPermission: vi.fn()
}));

vi.mock("@/lib/member-lifecycle", () => ({
  convertMemberToPlayer: vi.fn(),
  demoteMemberToGeneral: vi.fn(),
  finalizeWithdrawnMember: vi.fn(),
  recoverPendingWithdrawal: vi.fn(),
  setMemberOperationalStatus: vi.fn()
}));

const requireAdminPermissionMock = vi.mocked(requireAdminPermission);
const convertMemberToPlayerMock = vi.mocked(convertMemberToPlayer);
const demoteMemberToGeneralMock = vi.mocked(demoteMemberToGeneral);
const recoverPendingWithdrawalMock = vi.mocked(recoverPendingWithdrawal);
const finalizeWithdrawnMemberMock = vi.mocked(finalizeWithdrawnMember);
const setMemberOperationalStatusMock = vi.mocked(setMemberOperationalStatus);

const VALID_USER_ID = "11111111-1111-4111-8111-111111111111";

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  requireAdminPermissionMock.mockResolvedValue({
    id: "admin-1",
    email: "admin@example.com",
    name: "Admin",
    role: "MEMBER",
    permissions: { members: { read: true, write: true } },
    status: "ACTIVE"
  });
});

describe("admin members actions permission gate", () => {
  it("updateMemberTypeAction requires members.write before doing any work", async () => {
    requireAdminPermissionMock.mockRejectedValueOnce(new Error("__REDIRECT__:/admin?error=forbidden"));

    await expect(
      updateMemberTypeAction({ status: "idle", message: "" }, formData({ userId: VALID_USER_ID, userType: "PLAYER" }))
    ).rejects.toThrow("__REDIRECT__:/admin?error=forbidden");

    expect(requireAdminPermissionMock).toHaveBeenCalledWith("members", "write", "/admin/members");
    expect(convertMemberToPlayerMock).not.toHaveBeenCalled();
    expect(demoteMemberToGeneralMock).not.toHaveBeenCalled();
  });

  it("requestAdminStatusChangeAction requires members.write", async () => {
    requireAdminPermissionMock.mockRejectedValueOnce(new Error("__REDIRECT__:/admin?error=forbidden"));

    await expect(
      requestAdminStatusChangeAction(formData({ userId: VALID_USER_ID, status: "DORMANT" }))
    ).rejects.toThrow("__REDIRECT__:/admin?error=forbidden");

    expect(requireAdminPermissionMock).toHaveBeenCalledWith("members", "write", "/admin/members");
    expect(setMemberOperationalStatusMock).not.toHaveBeenCalled();
  });

  it("recoverMemberAction requires members.write", async () => {
    requireAdminPermissionMock.mockRejectedValueOnce(new Error("__REDIRECT__:/admin?error=forbidden"));

    await expect(recoverMemberAction(formData({ userId: VALID_USER_ID }))).rejects.toThrow(
      "__REDIRECT__:/admin?error=forbidden"
    );

    expect(requireAdminPermissionMock).toHaveBeenCalledWith("members", "write", "/admin/members");
    expect(recoverPendingWithdrawalMock).not.toHaveBeenCalled();
  });

  it("finalizeMemberWithdrawalAction requires members.write", async () => {
    requireAdminPermissionMock.mockRejectedValueOnce(new Error("__REDIRECT__:/admin?error=forbidden"));

    await expect(finalizeMemberWithdrawalAction(formData({ userId: VALID_USER_ID }))).rejects.toThrow(
      "__REDIRECT__:/admin?error=forbidden"
    );

    expect(requireAdminPermissionMock).toHaveBeenCalledWith("members", "write", "/admin/members");
    expect(finalizeWithdrawnMemberMock).not.toHaveBeenCalled();
  });

  it("rejects malformed userId at the action level even when authorized", async () => {
    await expect(
      requestAdminStatusChangeAction(formData({ userId: "not-a-uuid", status: "DORMANT" }))
    ).rejects.toThrow();

    expect(setMemberOperationalStatusMock).not.toHaveBeenCalled();
  });

  it("returns a validation error from updateMemberTypeAction for bad userType", async () => {
    const result = await updateMemberTypeAction(
      { status: "idle", message: "" },
      formData({ userId: VALID_USER_ID, userType: "ROOT" })
    );

    expect(result.status).toBe("error");
    expect(convertMemberToPlayerMock).not.toHaveBeenCalled();
    expect(demoteMemberToGeneralMock).not.toHaveBeenCalled();
  });

  it("delegates to convertMemberToPlayer when authorized and inputs are valid", async () => {
    const result = await updateMemberTypeAction(
      { status: "idle", message: "" },
      formData({ userId: VALID_USER_ID, userType: "PLAYER", affiliation: "경희고" })
    );

    expect(result.status).toBe("success");
    expect(convertMemberToPlayerMock).toHaveBeenCalledExactlyOnceWith(VALID_USER_ID, "경희고");
  });
});
