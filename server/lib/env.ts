import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(1).optional(),
  CORS_ORIGIN: z.string().min(1, 'CORS_ORIGIN is required'),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('Invalid environment configuration:');
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error(
      'Server refused to start: invalid environment configuration. See errors above.'
    );
  }

  const data = parsed.data;
  let jwtSecret = data.JWT_SECRET;

  if (!jwtSecret) {
    if (data.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is required outside development.');
    }
    jwtSecret = crypto.randomUUID() + crypto.randomUUID();
    console.warn(
      '[env] JWT_SECRET not set — generated an ephemeral development-only secret. ' +
        'Sessions will not survive a server restart. Set JWT_SECRET in .env for stable sessions.'
    );
  }

  return {
    NODE_ENV: data.NODE_ENV,
    PORT: data.PORT,
    DATABASE_URL: data.DATABASE_URL,
    JWT_SECRET: jwtSecret,
    CORS_ORIGINS: data.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean),
  };
}

export const env = loadEnv();
