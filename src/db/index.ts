import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import * as schema from "./schema";

// Determine if we have a real Neon connection string
const connectionString =
  process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

let dbInstance: any = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  if (connectionString && connectionString.startsWith("postgres")) {
    try {
      const pool = new Pool({ connectionString });
      dbInstance = drizzle(pool, { schema });
      return dbInstance;
    } catch (e) {
      console.warn("Neon DB pool initialization warning:", e);
    }
  }

  return null;
}

export const db = getDb();
export { schema };
