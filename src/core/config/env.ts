import { z } from "zod";

/**
 * Validated environment configuration.
 *
 * Single source of truth for all `import.meta.env` access. Components
 * and features depend on this typed `env` object, not on the raw Vite
 * env, decoupling them from the build system (Dependency Inversion).
 */
const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_APP_NAME: z.string().default("Agente Citas Dashboard"),
  VITE_SENTRY_DSN: z.string().optional().default(""),
  VITE_POSTHOG_KEY: z.string().optional().default(""),
  VITE_POSTHOG_HOST: z.string().url().optional().default("https://us.i.posthog.com"),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten());
  throw new Error("Invalid environment configuration. See console for details.");
}

export const env = parsed.data;
