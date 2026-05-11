const DEFAULT_SESSION_MAX_AGE_HOURS = 12;

export function getSessionMaxAgeMs() {
  const configuredHours = Number(process.env.SESSION_MAX_AGE_HOURS);
  const hours =
    Number.isFinite(configuredHours) && configuredHours > 0
      ? configuredHours
      : DEFAULT_SESSION_MAX_AGE_HOURS;

  return hours * 60 * 60 * 1000;
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
