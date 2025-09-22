import type { Config } from 'drizzle-kit';

export default {
  schema: './backend/utils/schema.ts',
  out: './backend/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;