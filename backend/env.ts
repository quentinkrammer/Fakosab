import { z } from "zod";

const untyped = {
  // @ts-ignore
  databaseUrl: import.meta.env.VITE_DATABASE_URL,
  // @ts-ignore
  salt: import.meta.env.VITE_SALT,
  // @ts-ignore
  port: import.meta.env.VITE_PORT,
  // @ts-ignore
  mode: import.meta.env.MODE,
};

export const env = z
  .object({
    databaseUrl: z.string(),
    mode: z.string(),
    salt: z.string().transform((value) => Number(value)),
    port: z.string().transform((value) => Number(value)),
  })
  .parse(untyped);
