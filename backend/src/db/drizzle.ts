import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "../../env.js";
import * as schema from "./schema.js";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  client: Client | undefined;
};

export const client =
  globalForDb.client ?? createClient({ url: env.databaseUrl });
if (process.env["NODE_ENV"] !== "production") globalForDb.client = client;

export const db = drizzle(client, { schema });
export type Db = typeof db;
