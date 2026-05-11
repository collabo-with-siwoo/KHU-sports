const DEFAULT_SESSION_MAX_AGE_HOURS = 12;
export const APP_SESSION_COOKIE_NAME = "khu_app_session_started_at";

export function getSessionMaxAgeMs() {
  const configuredHours = Number(process.env.SESSION_MAX_AGE_HOURS);
  const hours =
    Number.isFinite(configuredHours) && configuredHours > 0
      ? configuredHours
      : DEFAULT_SESSION_MAX_AGE_HOURS;

  return hours * 60 * 60 * 1000;
}

export function getSessionMaxAgeSeconds() {
  return Math.floor(getSessionMaxAgeMs() / 1000);
}

export function getAppSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getSessionMaxAgeSeconds()
  };
}

export function getAppSessionStartedAt(value?: string | null) {
  if (!value) {
    return null;
  }

  const startedAt = Number(value);

  return Number.isFinite(startedAt) && startedAt > 0 ? startedAt : null;
}

export function isAppSessionExpired(startedAt: number) {
  return Date.now() - startedAt > getSessionMaxAgeMs();
}

export function isSessionExpired(lastSignInAt?: string | null) {
  if (!lastSignInAt) {
    return false;
  }

  const signedInAt = new Date(lastSignInAt).getTime();

  if (!Number.isFinite(signedInAt)) {
    return false;
  }

  return Date.now() - signedInAt > getSessionMaxAgeMs();
}
