import { z } from "zod";

export const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_PUBLIC: z.string().min(1),
  R2_BUCKET_PRIVATE: z.string().min(1),
  R2_PUBLIC_BASE_URL: z.string().url(),
  RESEND_API_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  INITIAL_SUPER_ADMIN_EMAIL: z.string().email()
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(env: NodeJS.ProcessEnv): ServerEnv {
  return serverEnvSchema.parse(env);
}
