const REQUIRED_ENV_KEYS = [
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_PUBLIC",
  "R2_BUCKET_PRIVATE",
  "R2_PUBLIC_BASE_URL",
  "NEXT_PUBLIC_SITE_URL",
  "INITIAL_SUPER_ADMIN_EMAIL"
];

function hasValue(env, key) {
  return typeof env[key] === "string" && env[key].trim().length > 0;
}

function addCheck(checks, level, key, passed, message) {
  checks.push({ level, key, passed, message });
}

function evaluateBetaSecurityConfig(env = process.env) {
  const checks = [];

  for (const key of REQUIRED_ENV_KEYS) {
    addCheck(checks, "error", key, hasValue(env, key), `${key} must be configured.`);
  }

  if (hasValue(env, "R2_BUCKET_PUBLIC") && hasValue(env, "R2_BUCKET_PRIVATE")) {
    addCheck(
      checks,
      "error",
      "R2_BUCKET_PRIVATE",
      env.R2_BUCKET_PUBLIC.trim() !== env.R2_BUCKET_PRIVATE.trim(),
      "R2 public and private buckets must be different."
    );
  }

  if (hasValue(env, "RATE_LIMIT_ENABLED")) {
    addCheck(
      checks,
      "warning",
      "RATE_LIMIT_ENABLED",
      env.RATE_LIMIT_ENABLED.trim().toLowerCase() !== "false",
      "RATE_LIMIT_ENABLED=false disables app-level rate limiting."
    );
  }

  if (hasValue(env, "NEXT_PUBLIC_SITE_URL")) {
    const siteUrl = env.NEXT_PUBLIC_SITE_URL.trim();
    addCheck(
      checks,
      "warning",
      "NEXT_PUBLIC_SITE_URL",
      !/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(siteUrl),
      "NEXT_PUBLIC_SITE_URL points to a local address."
    );
  }

  if (hasValue(env, "INITIAL_SUPER_ADMIN_EMAIL")) {
    addCheck(
      checks,
      "warning",
      "INITIAL_SUPER_ADMIN_EMAIL",
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.INITIAL_SUPER_ADMIN_EMAIL.trim()),
      "INITIAL_SUPER_ADMIN_EMAIL should look like an email address."
    );
  }

  const errors = checks.filter((check) => check.level === "error" && !check.passed).map((check) => check.key);
  const warnings = checks.filter((check) => check.level === "warning" && !check.passed).map((check) => check.key);

  return {
    ok: errors.length === 0,
    checks,
    errors,
    warnings
  };
}

function formatBetaSecurityReport(result) {
  const lines = ["KHU Sports beta security preflight"];

  for (const check of result.checks) {
    if (check.passed) {
      lines.push(`[pass] ${check.key}`);
      continue;
    }

    lines.push(`[${check.level}] ${check.key}: ${check.message}`);
  }

  if (result.ok) {
    lines.push(result.warnings.length ? "Result: pass with warnings" : "Result: pass");
  } else {
    lines.push("Result: failed");
  }

  return lines.join("\n");
}

if (require.main === module) {
  const result = evaluateBetaSecurityConfig(process.env);
  const report = formatBetaSecurityReport(result);
  const output = result.ok ? console.log : console.error;

  output(report);
  process.exitCode = result.ok ? 0 : 1;
}

module.exports = {
  REQUIRED_ENV_KEYS,
  evaluateBetaSecurityConfig,
  formatBetaSecurityReport
};
