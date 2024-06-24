import { z } from "zod";

const untyped = {
  mode: import.meta.env.MODE,
};

export const env = z.object({ mode: z.string() }).parse(untyped);
