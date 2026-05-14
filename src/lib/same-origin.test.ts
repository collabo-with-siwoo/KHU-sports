import { describe, expect, it } from "vitest";
import { isSameOriginRequest, sameOriginForbiddenResponse } from "@/lib/same-origin";

function request(headers?: HeadersInit) {
  return new Request("https://khu-sports.vercel.app/admin/tournaments/t1/exports/private", {
    headers
  });
}

describe("isSameOriginRequest", () => {
  it("allows a same-origin Origin header", () => {
    expect(isSameOriginRequest(request({ origin: "https://khu-sports.vercel.app" }))).toBe(true);
  });

  it("allows requests without browser origin metadata", () => {
    expect(isSameOriginRequest(request())).toBe(true);
  });

  it("allows same-site and same-origin Fetch Metadata values", () => {
    expect(isSameOriginRequest(request({ "sec-fetch-site": "same-origin" }))).toBe(true);
    expect(isSameOriginRequest(request({ "sec-fetch-site": "same-site" }))).toBe(true);
    expect(isSameOriginRequest(request({ "sec-fetch-site": "none" }))).toBe(true);
  });

  it("blocks explicit cross-site Fetch Metadata", () => {
    expect(isSameOriginRequest(request({ "sec-fetch-site": "cross-site" }))).toBe(false);
  });

  it("blocks a mismatched Origin header", () => {
    expect(isSameOriginRequest(request({ origin: "https://evil.example" }))).toBe(false);
  });
});

describe("sameOriginForbiddenResponse", () => {
  it("returns a 403 response", async () => {
    const response = sameOriginForbiddenResponse();

    expect(response.status).toBe(403);
    await expect(response.text()).resolves.toBe("Forbidden");
  });
});
