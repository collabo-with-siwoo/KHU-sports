import { describe, expect, it } from "vitest";
import {
  resolveAdminConfirmedAt,
  resolveAdminMemo,
  resolvePlayerMemo,
  resolveRejectedAt,
  resolveRejectionReason,
  resolveScoreStatus,
  resolveSubmittedAt,
  toScoreStatusColumn
} from "./score-normalization";

function score(overrides: Partial<Parameters<typeof resolveScoreStatus>[0]> = {}) {
  return {
    scoreData: {},
    status: null,
    playerMemo: null,
    adminMemo: null,
    rejectionReason: null,
    submittedAt: null,
    adminConfirmedAt: null,
    rejectedAt: null,
    ...overrides
  };
}

describe("resolveScoreStatus", () => {
  it("prefers the dedicated column when present", () => {
    expect(
      resolveScoreStatus(
        score({
          status: "ADMIN_REJECTED",
          scoreData: { status: "SUBMITTED" }
        })
      )
    ).toBe("ADMIN_REJECTED");
  });

  it("falls back to scoreData.status when the column is null", () => {
    expect(resolveScoreStatus(score({ scoreData: { status: "SUBMITTED" } }))).toBe("SUBMITTED");
  });

  it("normalizes legacy synonyms in scoreData", () => {
    expect(resolveScoreStatus(score({ scoreData: { status: "TEMP" } }))).toBe("DRAFT");
    expect(resolveScoreStatus(score({ scoreData: { reviewStatus: "approved" } }))).toBe(
      "ADMIN_CONFIRMED"
    );
    expect(resolveScoreStatus(score({ scoreData: { submissionStatus: "Returned" } }))).toBe(
      "ADMIN_REJECTED"
    );
  });

  it("treats adminConfirmed:true as ADMIN_CONFIRMED when no status string is set", () => {
    expect(resolveScoreStatus(score({ scoreData: { adminConfirmed: true } }))).toBe(
      "ADMIN_CONFIRMED"
    );
  });

  it("returns NOT_STARTED when hasScore is false and no signal exists", () => {
    expect(resolveScoreStatus(score(), false)).toBe("NOT_STARTED");
  });

  it("returns DRAFT when hasScore is true and no signal exists", () => {
    expect(resolveScoreStatus(score())).toBe("DRAFT");
  });
});

describe("memo and timestamp resolvers", () => {
  it("prefers column over scoreData for memos and reasons", () => {
    const record = score({
      playerMemo: "from column",
      adminMemo: "admin from column",
      rejectionReason: "reason from column",
      scoreData: {
        playerMemo: "from json",
        adminMemo: "admin from json",
        rejectionReason: "reason from json"
      }
    });
    expect(resolvePlayerMemo(record)).toBe("from column");
    expect(resolveAdminMemo(record)).toBe("admin from column");
    expect(resolveRejectionReason(record)).toBe("reason from column");
  });

  it("falls back to scoreData when column is null", () => {
    const record = score({
      scoreData: {
        playerMemo: "fallback",
        adminMemo: "admin fallback",
        rejectionReason: "reason fallback"
      }
    });
    expect(resolvePlayerMemo(record)).toBe("fallback");
    expect(resolveAdminMemo(record)).toBe("admin fallback");
    expect(resolveRejectionReason(record)).toBe("reason fallback");
  });

  it("returns null when neither source has a value", () => {
    expect(resolvePlayerMemo(score())).toBeNull();
    expect(resolveAdminMemo(score())).toBeNull();
    expect(resolveRejectionReason(score())).toBeNull();
  });

  it("does not treat empty scoreData strings as a value", () => {
    expect(resolvePlayerMemo(score({ scoreData: { playerMemo: "" } }))).toBeNull();
  });

  it("prefers column timestamps and parses ISO strings from scoreData", () => {
    const columnDate = new Date("2026-05-01T00:00:00.000Z");
    expect(resolveSubmittedAt(score({ submittedAt: columnDate }))).toBe(columnDate);

    const fallback = resolveAdminConfirmedAt(
      score({ scoreData: { adminConfirmedAt: "2026-05-02T01:23:45.000Z" } })
    );
    expect(fallback?.toISOString()).toBe("2026-05-02T01:23:45.000Z");

    expect(resolveRejectedAt(score({ scoreData: { rejectedAt: "not-a-date" } }))).toBeNull();
  });
});

describe("toScoreStatusColumn", () => {
  it("returns null for NOT_STARTED and null inputs", () => {
    expect(toScoreStatusColumn(null)).toBeNull();
    expect(toScoreStatusColumn(undefined)).toBeNull();
    expect(toScoreStatusColumn("NOT_STARTED")).toBeNull();
  });

  it("passes through DB-backed status values verbatim", () => {
    expect(toScoreStatusColumn("DRAFT")).toBe("DRAFT");
    expect(toScoreStatusColumn("SUBMITTED")).toBe("SUBMITTED");
    expect(toScoreStatusColumn("ADMIN_CONFIRMED")).toBe("ADMIN_CONFIRMED");
    expect(toScoreStatusColumn("ADMIN_REJECTED")).toBe("ADMIN_REJECTED");
  });
});
