import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

/**
 * DATABASE_URL is optional. If not provided, the server will continue to
 * operate without database-backed logging or features.
 */
export let pool: pg.Pool | undefined;
export let db: any | undefined;
export const isDbEnabled = Boolean(process.env.DATABASE_URL);

if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
} else {
  console.warn("DATABASE_URL not set. Database functionality disabled.");
}
