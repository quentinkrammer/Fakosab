import { z } from "zod"

const untyped = {
    // @ts-ignore
    databaseUrl: import.meta.env.VITE_DATABASE_URL,
    // @ts-ignore
    salt: import.meta.env.VITE_SALT
}

export const env = z.object({ databaseUrl: z.string(), salt: z.string() }).parse(untyped)