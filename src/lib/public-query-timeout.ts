const DEFAULT_PUBLIC_QUERY_TIMEOUT_MS = 1500;

export class PublicQueryTimeoutError extends Error {
  constructor(scope: string, timeoutMs: number) {
    super(`${scope} exceeded ${timeoutMs}ms`);
    this.name = "PublicQueryTimeoutError";
  }
}

function getPublicQueryTimeoutMs() {
  const rawValue = process.env.PUBLIC_QUERY_TIMEOUT_MS;
  const parsed = rawValue ? Number.parseInt(rawValue, 10) : DEFAULT_PUBLIC_QUERY_TIMEOUT_MS;

  if (!Number.isFinite(parsed) || parsed < 250) {
    return DEFAULT_PUBLIC_QUERY_TIMEOUT_MS;
  }

  return Math.min(parsed, 5000);
}

export async function withPublicQueryTimeout<T>(scope: string, query: Promise<T>): Promise<T> {
  const timeoutMs = getPublicQueryTimeoutMs();
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new PublicQueryTimeoutError(scope, timeoutMs)), timeoutMs);
  });

  try {
    return await Promise.race([query, timeoutPromise]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}
