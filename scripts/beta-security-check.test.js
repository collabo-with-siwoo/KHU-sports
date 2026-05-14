import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const {
  evaluateBetaSecurityConfig,
  formatBetaSecurityReport
} = require("./beta-security-check");

const completeEnv = {
  DATABASE_URL: "postgres://secret-db",
  DIRECT_URL: "postgres://secret-direct",
  NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "secret-anon",
  SUPABASE_SERVICE_ROLE_KEY: "secret-service-role",
  R2_ACCOUNT_ID: "secret-account",
  R2_ACCESS_KEY_ID: "secret-access",
  R2_SECRET_ACCESS_KEY: "secret-r2",
  R2_BUCKET_PUBLIC: "khusports-public",
  R2_BUCKET_PRIVATE: "khusports-private",
  R2_PUBLIC_BASE_URL: "https://cdn.example.com",
  NEXT_PUBLIC_SITE_URL: "https://khu-sports.vercel.app",
  INITIAL_SUPER_ADMIN_EMAIL: "admin@example.com"
};

describe("evaluateBetaSecurityConfig", () => {
  it("reports missing required environment variables as errors", () => {
    const result = evaluateBetaSecurityConfig({});

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("DATABASE_URL");
    expect(result.errors).toContain("INITIAL_SUPER_ADMIN_EMAIL");
  });

  it("passes a complete beta environment", () => {
    const result = evaluateBetaSecurityConfig(completeEnv);

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it("warns when app rate limiting is disabled", () => {
    const result = evaluateBetaSecurityConfig({
      ...completeEnv,
      RATE_LIMIT_ENABLED: "false"
    });

    expect(result.ok).toBe(true);
    expect(result.warnings).toContain("RATE_LIMIT_ENABLED");
  });

  it("errors when public and private R2 bucket names match", () => {
    const result = evaluateBetaSecurityConfig({
      ...completeEnv,
      R2_BUCKET_PRIVATE: completeEnv.R2_BUCKET_PUBLIC
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("R2_BUCKET_PRIVATE");
  });

  it("formats reports without leaking secret values", () => {
    const result = evaluateBetaSecurityConfig({
      ...completeEnv,
      RATE_LIMIT_ENABLED: "false"
    });
    const report = formatBetaSecurityReport(result);

    expect(report).toContain("RATE_LIMIT_ENABLED");
    expect(report).not.toContain("secret-service-role");
    expect(report).not.toContain("postgres://secret-db");
    expect(report).not.toContain("secret-r2");
  });
});
