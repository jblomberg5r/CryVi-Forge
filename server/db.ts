import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_P5nZFvYhw0BI@ep-wild-mouse-a9w7vfkg-pooler.gwc.azure.neon.tech/neondb?sslmode=require";

if (!connectionString) { // This condition should ideally not be met now
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString });
export const db = drizzle({ client: pool, schema });