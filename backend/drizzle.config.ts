import { type Config } from "drizzle-kit";
import { env } from "./env.js"



export default {
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: env.databaseUrl,
  },
} satisfies Config;
